# API Documentation

Base URL:

```text
http://localhost:5000/api
```

Interactive Swagger documentation:

```text
http://localhost:5000/api/docs
```

All protected routes require:

```http
Authorization: Bearer ACCESS_TOKEN
```

## Authentication

### Register

`POST /auth/register`

```json
{
  "fullName": "Gresa Ismajli",
  "email": "gresa@test.com",
  "password": "password123"
}
```

### Login

`POST /auth/login`

Returns an access token, refresh token, and user profile.

```json
{
  "email": "gresa@test.com",
  "password": "password123"
}
```

### Refresh Access Token

`POST /auth/refresh`

```json
{
  "refreshToken": "REFRESH_TOKEN"
}
```

### Logout

`POST /auth/logout`

```json
{
  "refreshToken": "REFRESH_TOKEN"
}
```

### Current User

`GET /auth/me`

## Dashboard

`GET /dashboard/summary`

Returns totals, recent claims/payments, and status chart data.

## Clients

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/clients` | List clients |
| GET | `/clients?search=value` | Search clients |
| GET | `/clients/:id` | Get one client |
| POST | `/clients` | Create client |
| PUT | `/clients/:id` | Update client |
| DELETE | `/clients/:id` | Delete client, admin only |

Example create/update body:

```json
{
  "firstName": "Arta",
  "lastName": "Berisha",
  "email": "arta@example.com",
  "phone": "+38344111222",
  "personalNumber": "1234567890",
  "address": "Main Street 10",
  "city": "Prishtina"
}
```

## Insurance Types

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/insurance-types` | List insurance types |
| GET | `/insurance-types?search=value` | Search insurance types |
| GET | `/insurance-types/:id` | Get one insurance type |
| POST | `/insurance-types` | Create insurance type, admin only |
| PUT | `/insurance-types/:id` | Update insurance type, admin only |
| DELETE | `/insurance-types/:id` | Delete insurance type, admin only |

```json
{
  "name": "Travel Insurance",
  "description": "Coverage for travel risks.",
  "basePrice": 80,
  "isActive": true
}
```

## Policies

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/policies` | List policies |
| GET | `/policies?search=value&status=active` | Search/filter policies |
| GET | `/policies/:id` | Get one policy |
| POST | `/policies` | Create policy |
| PUT | `/policies/:id` | Update policy |
| DELETE | `/policies/:id` | Delete policy, admin only |

```json
{
  "clientId": 1,
  "insuranceTypeId": 2,
  "policyNumber": "POL-001",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "premiumAmount": 250,
  "coverageAmount": 10000,
  "status": "active"
}
```

## Claims

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/claims` | List claims |
| GET | `/claims?search=value&status=submitted` | Search/filter claims |
| GET | `/claims/:id` | Get one claim |
| POST | `/claims` | Create claim |
| PUT | `/claims/:id` | Update claim |
| DELETE | `/claims/:id` | Delete claim, admin only |

```json
{
  "policyId": 1,
  "claimNumber": "CLM-001",
  "claimDate": "2026-02-10",
  "description": "Accident claim",
  "requestedAmount": 1200,
  "approvedAmount": null,
  "status": "submitted"
}
```

## Payments

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/payments` | List payments |
| GET | `/payments?search=value&status=completed` | Search/filter payments |
| GET | `/payments/:id` | Get one payment |
| POST | `/payments` | Create payment |
| PUT | `/payments/:id` | Update payment |
| DELETE | `/payments/:id` | Delete payment, admin only |

```json
{
  "policyId": 1,
  "paymentDate": "2026-03-01",
  "amount": 250,
  "method": "bank_transfer",
  "status": "completed",
  "referenceNumber": "PAY-001"
}
```

## Status Values

- Policy: `active`, `expired`, `cancelled`
- Claim: `submitted`, `reviewing`, `approved`, `rejected`, `paid`
- Payment: `pending`, `completed`, `failed`
- Payment method: `cash`, `card`, `bank_transfer`

## Authorization Rules

- `admin`: full access, including delete operations and insurance type management.
- `agent`: can view, create, and update clients, policies, claims, and payments.
