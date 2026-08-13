# ADR-0001: Keep the current product scope single-company

- Status: Accepted
- Date: 2026-07-29

## Context

ALFI BOT is an academic MVP operated as one application for one organization. Its users have application roles, but the current database and API contracts do not contain an organization or tenant boundary.

Introducing multi-tenancy now would require tenant identifiers, row-level isolation, tenant-aware authorization, provisioning, migrations, support procedures and additional security tests. Those capabilities are not required by the current product backlog.

## Decision

The current ALFI BOT release remains single-company.

The roles `usuario`, `auditor` and `administrador` are global application roles inside this deployment. New code must not add speculative `tenantId`, `organizationId` or equivalent fields unless a later approved requirement introduces multi-tenancy.

## Consequences

- The data model and authorization rules remain smaller and easier to verify for the academic scope.
- Deployment documentation assumes one organization per ALFI BOT installation.
- A future multi-tenant version will require a new ADR, a migration plan and explicit data-isolation tests.
- This decision does not prevent multiple users from using the same installation.
