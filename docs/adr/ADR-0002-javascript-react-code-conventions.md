# ADR-0002: Standardize JavaScript and React code conventions

- Status: Accepted
- Date: 2026-08-12

## Context

ALFI BOT contains a Node.js backend and a React frontend maintained by multiple contributors. The code already uses ES Modules and modern Node.js, but function declarations and naming styles are not fully consistent. A full mechanical rewrite would create a large review surface and unnecessary regression risk.

## Decision

New project-owned JavaScript and React code follows these conventions:

- Use ES Modules with `import` and `export`.
- Use arrow functions for new project-owned functions and React components.
- Use `async`/`await` for readable asynchronous control flow.
- Use `camelCase` for variables and functions.
- Use `PascalCase` for React components.
- Use `UPPER_SNAKE_CASE` for global constants and environment variables.
- Use two spaces for JavaScript, JSX, JSON and Markdown indentation.
- Prefer single quotes in new JavaScript and JSX unless interpolation or escaping makes another form clearer.
- Keep one responsibility per module and use explicit names instead of unexplained abbreviations.

A traditional `function` declaration is allowed only for a documented technical reason, such as generator semantics or required hoisting. Framework APIs and third-party code are outside this convention.

Existing code is migrated incrementally when the change is safe, reviewable and protected by tests or a successful build. Convention-only refactors must not intentionally change behavior.

## Consequences

- New code has a predictable style across frontend and backend.
- Reviewers can distinguish behavior changes from convention-only refactors.
- Some legacy declarations remain temporarily to avoid a risky repository-wide rewrite.
- The automated convention test protects the ADR structure and the modules already migrated under AFB-337.
- Any exception must be visible in code review and include its technical reason.
