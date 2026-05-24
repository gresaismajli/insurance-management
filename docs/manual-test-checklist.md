# Manual Test Checklist

Use this checklist before project presentation.

## Environment

- Backend starts with `npm run dev`.
- Frontend starts with `npm start`.
- `GET /api/health` returns `status: ok`.
- `GET /api/database/health` returns `status: ok`.

## Authentication

- Register a new user.
- Login with the created user.
- Logout clears the session.
- Protected pages redirect to `/login` when logged out.
- Invalid credentials show an error message.
- Expired access token is refreshed using the refresh token.

## Dashboard

- Dashboard loads after login.
- Client, policy, claim, and payment statistics display.
- Status charts display when records exist.
- Recent claims and recent payments display.

## Clients

- Create a client.
- Search clients.
- Edit a client.
- Delete a client as admin.
- Verify duplicate email/personal number shows an error.

## Insurance Types

- Create an insurance type as admin.
- Search insurance types.
- Edit an insurance type.
- Delete an unused insurance type.
- Verify duplicate name shows an error.

## Policies

- Create a policy using an existing client and insurance type.
- Filter policies by status.
- Search policies by number, client, or type.
- Edit a policy.
- Delete an unused policy as admin.
- Verify end date must be after start date.

## Claims

- Create a claim for an existing policy.
- Filter claims by status.
- Search claims.
- Edit a claim.
- Delete a claim as admin.

## Payments

- Create a payment for an existing policy.
- Filter payments by status.
- Search payments.
- Edit a payment.
- Delete a payment as admin.
- Verify duplicate reference number shows an error.

## Browser Check

Test the main flow in:

- Chrome
- Edge
- Firefox or Brave

## Presentation Check

- Explain the database relationships.
- Explain JWT access tokens and refresh tokens.
- Explain protected routes and role authorization.
- Explain one CRUD flow from frontend to backend to database.
- Be ready to change one validation rule or table column live.

