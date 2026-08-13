# ADR-0003: Separate role routes and enforce authorization in the backend

- Status: Accepted
- Date: 2026-08-12

## Context

ALFI BOT serves public visitors, registered users, auditors and administrators from one React application. The roles require different entry points and capabilities. Hiding frontend controls is useful for navigation, but it cannot protect an API because browser state can be modified by a user.

## Decision

The application uses separate visual routes for each audience:

- `/` for the public landing page.
- `/app` for the authenticated user analysis experience.
- `/auditor/login` and `/auditor` for the auditor entry point and portal.
- `/admin/login` and `/admin` for the administrator entry point and portal.

The frontend centralizes browser session access in `frontend/src/auth/authStorage.js` and uses role-aware navigation as a user-experience guard.

The backend is the security authority. It validates the authentication token through `auth.middleware.js` and authorizes protected operations through explicit roles or permissions in `authorization.middleware.js` and `permissions.js`. The canonical application roles are `usuario`, `auditor` and `administrador`.

Visual routing and backend authorization must evolve together. Adding a route or button never grants permission by itself.

## Consequences

- Each role receives a clear entry point and interface.
- Direct API requests remain protected even when frontend checks are bypassed.
- Authentication logic and permission mappings have defined source modules.
- Every new protected endpoint requires an authentication middleware and an explicit authorization rule.
- Route changes must include navigation/build verification and permission changes must include backend RBAC tests.
