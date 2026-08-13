# Architecture Decision Records

This directory stores the accepted and proposed Architecture Decision Records (ADRs) for ALFI BOT.

## Naming and numbering

- Decision files use `ADR-NNNN-kebab-case-title.md`.
- Numbers are four-digit, unique, and sequential.
- ADRs are written in English.
- An accepted ADR is immutable except for typo or link corrections.
- A changed decision requires a new ADR that marks the previous one as superseded.

## Required structure

```markdown
# ADR-NNNN: Decision title

- Status: Proposed | Accepted | Deprecated | Superseded by ADR-NNNN
- Date: YYYY-MM-DD

## Context

## Decision

## Consequences
```

Optional sections such as `Alternatives considered`, `Migration` or `References` may be added after the required sections.

## Decision index

| ADR | Status | Decision |
|---|---|---|
| [ADR-0001](ADR-0001-single-company-scope.md) | Accepted | Keep the current product scope single-company |
| [ADR-0002](ADR-0002-javascript-react-code-conventions.md) | Accepted | Standardize JavaScript and React conventions |
| [ADR-0003](ADR-0003-routing-authentication-rbac.md) | Accepted | Separate role routes and enforce authorization in the backend |
| [ADR-0004](ADR-0004-fraud-category-taxonomy.md) | Accepted | Use a canonical four-category fraud taxonomy |
