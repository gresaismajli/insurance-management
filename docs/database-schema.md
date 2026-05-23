# Database Schema

Database: `insurance_management`

## Entities

### roles

Stores application roles such as `admin` and `agent`.

### users

Stores users who can log in to the system. Each user belongs to one role.

Relationship:

- `users.role_id` references `roles.id`

### refresh_tokens

Stores hashed refresh tokens for secure session management.

Relationship:

- `refresh_tokens.user_id` references `users.id`

### clients

Stores insurance client information.

Important constraints:

- `email` is unique
- `personal_number` is unique

### insurance_types

Stores available insurance categories, for example health, car, home, and life insurance.

Important constraints:

- `name` is unique
- `base_price` cannot be negative

### policies

Stores insurance policies purchased by clients.

Relationships:

- `policies.client_id` references `clients.id`
- `policies.insurance_type_id` references `insurance_types.id`

Important constraints:

- `policy_number` is unique
- `end_date` must be after `start_date`
- `premium_amount` and `coverage_amount` cannot be negative

### claims

Stores claims submitted for policies.

Relationship:

- `claims.policy_id` references `policies.id`

Important constraints:

- `claim_number` is unique
- `requested_amount` cannot be negative
- `approved_amount` cannot be negative when present

### payments

Stores payments made for policies.

Relationship:

- `payments.policy_id` references `policies.id`

Important constraints:

- `amount` cannot be negative
- `reference_number` is unique when provided

## Main Relationships

```text
roles 1 - * users
users 1 - * refresh_tokens
clients 1 - * policies
insurance_types 1 - * policies
policies 1 - * claims
policies 1 - * payments
```

## Indexes

Indexes are added for:

- User roles
- Token lookup by user
- Client names
- Policy client/type/status lookup
- Claim policy/status lookup
- Payment policy/status lookup

