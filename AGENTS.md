# Repository Guide for AI Agents

Before changing application behavior, read [the feature and API guide](docs/FEATURES.md) and then inspect the relevant source files. The guide maps routes, guards, business workflows, and module ownership; source code remains authoritative.

Keep `docs/FEATURES.md` synchronized when changing controllers, routes, guards, role requirements, business workflows, scheduled jobs, or module responsibilities. Verify access behavior from actual decorators and guard implementations rather than inferring it from names or Swagger descriptions.

Build and test commands:

- `bun run build` — compile the NestJS application.
- `bun run test` — run the test suite.
- `bun run test:e2e` — run end-to-end tests.

Do not copy credentials or other `.env` values into documentation, logs, or source examples.
