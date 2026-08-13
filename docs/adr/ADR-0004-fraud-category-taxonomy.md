# ADR-0004: Use a canonical four-category fraud taxonomy

- Status: Accepted
- Date: 2026-08-12

## Context

ALFI BOT groups preventive analysis results for reporting and consistent presentation. Free-form category names would fragment PostgreSQL data and make frontend labels, API responses and aggregate reports disagree.

The current product scope has four defined fraud categories. The backend also receives variations from model output and needs to normalize supported aliases without inventing a new stored category.

## Decision

The canonical API and PostgreSQL values use `snake_case` and are limited to:

| Value | Display label | Meaning |
|---|---|---|
| `credito_falso` | Crédito falso | A nonexistent or deceptive credit or loan offer |
| `ponzi` | Esquema Ponzi | Returns funded mainly with money from new participants |
| `piramidal` | Esquema piramidal | A scheme driven mainly by recruiting participants or referrals |
| `inversion_fraudulenta` | Inversión fraudulenta | A nonexistent or deceptive investment with false or unrealistic returns |

`backend/src/config/aiPolicy.js` is the source of truth for accepted values and normalization aliases. Unsupported or absent categories normalize to `null`. `frontend/src/utils/fraudCategory.js` maps canonical values to presentation labels and must not create additional domain values.

A category change requires coordinated updates to the backend policy and response contract, PostgreSQL constraints or reporting, frontend labels, tests and documentation.

## Consequences

- API, database, frontend and reports use stable identifiers.
- Known wording variations can be normalized without changing stored data.
- Unknown model output does not silently create a new category.
- Expanding or replacing the taxonomy is an explicit cross-component change and may require a new ADR when the policy changes materially.
