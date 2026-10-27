# POS App API — Feature and API Guide

This document is the code-grounded guide to the application's features, HTTP
routes, authentication, authorization, and important business flows. It is
intended for developers and AI coding agents. When this guide and the source
code disagree, the source code is authoritative; update this guide when a
feature, route, guard, or business rule changes.

## Contents

- [Application overview](#application-overview)
- [API conventions](#api-conventions)
- [Authentication and authorization](#authentication-and-authorization)
- [HTTP API catalog](#http-api-catalog)
- [Business workflows](#business-workflows)
- [Background jobs](#background-jobs)
- [Module map](#module-map)
- [Working on this codebase](#working-on-this-codebase)

## Application overview

The API provides multi-user, multi-store point-of-sale and inventory
functionality.

| Concern           | Implementation                                                        |
| ----------------- | --------------------------------------------------------------------- |
| HTTP framework    | NestJS 12 on Fastify                                                  |
| Language/runtime  | TypeScript; Bun for build, development, and runtime                   |
| Persistence       | PostgreSQL through Sequelize / `sequelize-typescript`                 |
| Session and cache | Redis through `ioredis` and the Nest Redis module                     |
| Background jobs   | Nest Schedule; BullMQ is configured against Redis                     |
| Validation        | Global Nest `ValidationPipe` with DTO transformation and whitelisting |
| API documentation | Swagger at `/doc` in non-production; opt-in in production             |

The application is organized by feature under `src/modules/`. The main
business areas are authentication, users, stores, inventory, and point of sale.
Health checks are provided separately.

## API conventions

- The global prefix is `/api/`, except `GET /`, which is explicitly excluded.
- Controllers with URI version `1` are served under `/api/v1`.
- `HealthController` has no controller version, so its health route is
  `/api/health`.
- Session cookies are HTTP-only. In production they are marked `Secure`; the
  application trusts the reverse proxy for forwarded request metadata.
- CORS origins come from the comma-separated `CORS_ORIGINS` environment
  variable. The same configured origins are trusted by Nest's cross-origin
  protection. For each request, the response must contain one matching
  `Access-Control-Allow-Origin` value.
- Global request throttling is 120 requests per minute. Login is limited to
  5 requests per minute and registration to 3 requests per minute.
- DTOs are validated globally. Unknown fields are stripped; implicit
  conversion is disabled.
- Pagination is supplied through `PaginationDto` on list endpoints that accept
  it. Query DTOs define each endpoint's supported filters.

## Authentication and authorization

### Session authentication

`AuthGuard` is registered globally by `AuthModule`. Protected requests must
present a valid `sessionId` cookie whose session payload exists and whose
session ID matches the user's current session record in Redis. The guard
attaches the authenticated payload to `request.user`.

`POST /api/v1/auth/login` is public. On successful login it stores the user
payload in the Fastify session and writes the session ID to Redis. The login
endpoint returns a success message; the browser receives the session cookie
from the response. `rememberMe` extends the session cookie to 30 days.

### Global guards

Global guards are registered in `AuthModule` in this order:

1. **`AuthGuard`** — requires a valid session unless the route has `@Public()`.
2. **`RolesGuard`** — enforces roles declared with `@Roles(...)`.
3. **`StoreSessionGuard`** — requires a selected store unless the controller or
   route has `@SessionFree()`. When selected, the store context is attached as
   `request.storeSession`.

`@SessionFree()` only skips selected-store enforcement; it does **not** make a
route unauthenticated. `@Public()` skips authentication. For example, login is
both public and session-free, while logout is session-free but still requires
authentication.

### Store-scoped guards

| Guard                 | Purpose                                                                                                                                                                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `StoreAcessRoleGuard` | Reads `@StoreAccess(...)`; global `ADMIN` users bypass store membership checks. Other users must be members of the route's store and match an allowed store role or owner condition. If no restriction is specified, any store member is accepted. |
| `StoreContextGuard`   | Checks that the selected store matches `:id`. Resource ownership is enforced by scoped queries in the relevant services.                                                                                                                           |
| `PosSessionGuard`     | Requires an active POS session for the selected store and attaches it to `request.posSession`.                                                                                                                                                     |

Store roles are `admin` and `cashier`. Global user roles are `ADMIN` and `USER`.
Store role access and global roles are distinct: store administrators are
members of an individual store; global `ADMIN` is an application-wide role.

## HTTP API catalog

All paths below include the global `/api` prefix. Unless marked public, a
valid authenticated session is required.

### Health

| Method | Path          | Access | Behavior                                                           |
| ------ | ------------- | ------ | ------------------------------------------------------------------ |
| `GET`  | `/api/health` | Public | Checks PostgreSQL, Redis, disk usage, and process heap/RSS memory. |

### Authentication — `/api/v1/auth`

The controller is session-free; only routes explicitly marked public skip
authentication.

| Method | Path                    | Access           | Behavior                                                                                                      |
| ------ | ----------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------- |
| `POST` | `/api/v1/auth/login`    | Public; 5/minute | Authenticates by username or email and password, creates a Redis-backed session, and sets the session cookie. |
| `POST` | `/api/v1/auth/register` | Public; 3/minute | Registers a standard user account.                                                                            |
| `GET`  | `/api/v1/auth/me`       | Authenticated    | Returns the current authenticated payload.                                                                    |
| `POST` | `/api/v1/auth/logout`   | Authenticated    | Destroys the current session and clears the session cookie.                                                   |

### Users — `/api/v1/users`

The whole controller requires global `ADMIN` through `@Roles(UserRole.ADMIN)`.
It is session-free, so selecting a store is not required.

| Method   | Path                | Access         | Behavior                                                |
| -------- | ------------------- | -------------- | ------------------------------------------------------- |
| `GET`    | `/api/v1/users`     | Global `ADMIN` | Lists users with `QueryUserDto` filters and pagination. |
| `GET`    | `/api/v1/users/:id` | Global `ADMIN` | Returns one user and associated store membership data.  |
| `PATCH`  | `/api/v1/users/:id` | Global `ADMIN` | Updates the supplied user fields.                       |
| `DELETE` | `/api/v1/users/:id` | Global `ADMIN` | Deletes a user.                                         |

### Global item catalog — `/api/v1/items`

The whole controller requires global `ADMIN` and does not require a selected
store.

| Method   | Path                | Access         | Behavior                                 |
| -------- | ------------------- | -------------- | ---------------------------------------- |
| `POST`   | `/api/v1/items`     | Global `ADMIN` | Creates an item.                         |
| `GET`    | `/api/v1/items`     | Global `ADMIN` | Lists items with filters and pagination. |
| `GET`    | `/api/v1/items/:id` | Global `ADMIN` | Returns one item.                        |
| `PATCH`  | `/api/v1/items/:id` | Global `ADMIN` | Updates an item.                         |
| `DELETE` | `/api/v1/items/:id` | Global `ADMIN` | Deletes an item.                         |

Store-owned catalog operations are exposed under
`/api/v1/store/:id/items` instead.

### Stores — `/api/v1/store`

All routes require authentication and are session-free unless scoped-store
access is explicitly described.

| Method   | Path                                  | Access                                                               | Behavior                                                                                   |
| -------- | ------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `POST`   | `/api/v1/store`                       | Any authenticated user                                               | Creates a store and its initial store-admin membership.                                    |
| `GET`    | `/api/v1/store`                       | Global `ADMIN`                                                       | Lists stores with filters and pagination.                                                  |
| `GET`    | `/api/v1/store/my-store`              | Authenticated user                                                   | Lists stores where the current user has active membership.                                 |
| `POST`   | `/api/v1/store/:id/select`            | Authenticated store member                                           | Selects the store for the current session and saves its store role in the session payload. |
| `GET`    | `/api/v1/store/:id`                   | Store `admin` or `cashier`; global `ADMIN` bypasses membership check | Returns store details.                                                                     |
| `DELETE` | `/api/v1/store/:id`                   | Global `ADMIN`                                                       | Deletes a store.                                                                           |
| `POST`   | `/api/v1/store/:id/assign`            | Store `admin`; global `ADMIN` bypasses membership check              | Adds a user as a cashier, or reactivates an inactive membership.                           |
| `POST`   | `/api/v1/store/:id/unassign`          | Store `admin`; global `ADMIN` bypasses membership check              | Marks a store membership inactive.                                                         |
| `GET`    | `/api/v1/store/:id/members`           | Store `admin` or `cashier`; global `ADMIN` bypasses membership check | Lists store members.                                                                       |
| `PATCH`  | `/api/v1/store/:id/members/:memberId` | Store `admin`; global `ADMIN` bypasses membership check              | Updates a member after verifying that the membership belongs to the route's store.         |

`StoreAccess` restrictions are enforced by `StoreAcessRoleGuard`. Selecting a
store is required for the store-scoped business controllers below; the store
management controller opts out of that global requirement and applies explicit
store-role checks to its restricted routes.

`StoreController` contains an update method with store-admin metadata, but it
currently has no HTTP method/path decorator, so no store-update route is
registered.

### Store catalog and categories — `/api/v1/store/:id/items`

`StoreContextGuard` applies to this controller and verifies the selected store
matches `:id`. Resource lookups and mutations include the route's store ID in
their service queries. Routes marked admin-only additionally use
`StoreAcessRoleGuard`.

| Method   | Path                                             | Access                                         | Behavior                                                                         |
| -------- | ------------------------------------------------ | ---------------------------------------------- | -------------------------------------------------------------------------------- |
| `POST`   | `/api/v1/store/:id/items`                        | Store `admin`                                  | Creates an item owned by the selected store.                                     |
| `GET`    | `/api/v1/store/:id/items`                        | Any authenticated member of the selected store | Lists store items with filters and pagination.                                   |
| `GET`    | `/api/v1/store/:id/items/:itemId`                | Any authenticated member of the selected store | Returns an item.                                                                 |
| `PATCH`  | `/api/v1/store/:id/items/:itemId`                | Store `admin`                                  | Updates an item.                                                                 |
| `DELETE` | `/api/v1/store/:id/items/:itemId`                | Store `admin`                                  | Deletes an item.                                                                 |
| `POST`   | `/api/v1/store/:id/items/categories`             | Store `admin`                                  | Creates an item category.                                                        |
| `GET`    | `/api/v1/store/:id/items/categories`             | Any authenticated member of the selected store | Lists item categories with pagination.                                           |
| `DELETE` | `/api/v1/store/:id/items/categories/:categoryId` | Store `admin`                                  | Deletes an item category.                                                        |
| `POST`   | `/api/v1/store/:id/items/:itemId/component`      | Any authenticated member of the selected store | Adds a bundle component. This route currently has no explicit store-admin guard. |

The bundle-component route is intentionally described according to its
current guard annotations; do not assume it is admin-only.

### POS sessions — `/api/v1/store/:id/pos-session`

`StoreContextGuard` applies to all routes. Opening and reading a
session needs a selected store; closing additionally requires an active POS
session.

| Method   | Path                                            | Access                                       | Behavior                                                                 |
| -------- | ----------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------ |
| `POST`   | `/api/v1/store/:id/pos-session`                 | Authenticated member of selected store       | Opens a POS session and records opening stock quantities.                |
| `GET`    | `/api/v1/store/:id/pos-session/current-session` | Authenticated member of selected store       | Returns the active session, if any.                                      |
| `GET`    | `/api/v1/store/:id/pos-session`                 | Authenticated member of selected store       | Lists POS sessions with filters and pagination.                          |
| `DELETE` | `/api/v1/store/:id/pos-session`                 | Authenticated member with active POS session | Closes the active session and posts sold quantities to the stock ledger. |

### Sales and sellable items — `/api/v1/store/:id/transaction`

`StoreContextGuard` applies to every route.

| Method   | Path                                            | Access                                                  | Behavior                                                                                                                                                                                                         |
| -------- | ----------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST`   | `/api/v1/store/:id/transaction`                 | Authenticated member with active POS session            | Creates a sales invoice and invoice lines, consumes POS-session stock, and calculates the total.                                                                                                                 |
| `GET`    | `/api/v1/store/:id/transaction/sellable-item`   | Authenticated member with active POS session            | Lists active, non-raw-material items belonging to the selected store. Direct stock availability comes from POS session entries; bundle availability is calculated from its component quantities in that session. |
| `DELETE` | `/api/v1/store/:id/transaction/:salesInvoiceId` | Store `admin`; global `ADMIN` bypasses membership check | Soft-deletes a sales transaction.                                                                                                                                                                                |

The controller path is `/store/:id/transaction`; invoice history and invoice
completion use the separate `/store/:id/invoice` controller below.

### Sales invoices — `/api/v1/store/:id/invoice`

`StoreContextGuard` applies to every route. Invoice lookups and mutations
include the selected store ID in their service queries.

| Method  | Path                                                 | Access                                 | Behavior                                                                                                                                                                                                                                                                                                   |
| ------- | ---------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`   | `/api/v1/store/:id/invoice`                          | Authenticated member of selected store | Lists invoices for the selected store with filters and pagination. Defaults to today in UTC; `dateRange=today` filters the current day, `dateRange=last30days` the rolling last 30 days, and `dateRange=custom&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` inclusive calendar dates in the supplied timezone. |
| `GET`   | `/api/v1/store/:id/invoice/:salesInvoiceId`          | Authenticated member of selected store | Returns an invoice and its details.                                                                                                                                                                                                                                                                        |
| `PATCH` | `/api/v1/store/:id/invoice/:salesInvoiceId/complete` | Invoice creator or global `ADMIN`      | Marks the invoice complete. The service enforces this creator/admin rule.                                                                                                                                                                                                                                  |

When `dateRange` is supplied, `timezone` is required and must be an IANA
timezone (for example `Asia/Jakarta`). When `dateRange` is omitted, the list
defaults to today in UTC. A custom range requires both valid dates, and its
start date must not be after its end date; these constraints are validated by
the query DTO.

### Stock — `/api/v1/store/:id`

`StoreContextGuard` requires that the request's selected store matches `:id`.

| Method | Path                             | Access                                 | Behavior                                                             |
| ------ | -------------------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| `GET`  | `/api/v1/store/:id/stock-ledger` | Authenticated member of selected store | Lists stock movement ledger entries with filters and pagination.     |
| `GET`  | `/api/v1/store/:id/bins`         | Authenticated member of selected store | Lists store inventory bins and balances with filters and pagination. |

## Business workflows

### Store and membership

1. An authenticated user creates a store.
2. The creator receives store-admin membership. When the creator is not a
   global `ADMIN`, the configured initial user is also assigned as store admin.
3. A user selects a store; its ID and store role are stored in the authenticated
   session.
4. Store-scoped routes validate the selected store and, where specified, the
   store membership/role.

### Inventory and opening stock

- Item types are `raw_material`, `finished_good`, and `item_bundle`.
- Items can have an inventory bin and stock-ledger history. Item categories
  organize a store's catalog.
- Bundle items are composed of components. Bundle availability is derived
  from component availability; nested bundles are expanded when calculating
  the stock required for a sale. Circular bundles and invalid/non-positive
  component quantities are rejected.
- Opening a POS session snapshots/records opening quantities for sellable,
  stock-managed items and reserves those quantities in bins. Omitted opening
  quantities default to the bin's current actual quantity. Requested opening
  quantities must be non-negative integers and cannot exceed available stock.
- Raw materials cannot be sold directly. Items that do not maintain stock do
  not consume POS-session stock.

### Sales transaction and stock

1. A sale requires an active POS session for the selected store.
2. The service creates the invoice and its lines inside a Sequelize
   transaction.
3. Invoice-line amounts are calculated from item selling price and quantity.
4. Bundle lines expand recursively into component stock requirements.
5. Session item rows are locked and sold quantities are incremented. Stock
   underflow is rejected for stock-managed items.
6. The invoice total is the sum of its line amounts.
7. Closing the POS session writes outbound stock-ledger entries for sold
   quantities and marks the session closed, within a transaction.

Sales invoice status values are defined in
`src/modules/point-of-sale/utils/pos.type.ts`; check the enum before relying on
serialized status spelling.

## Background jobs

`StoreService` runs an automatic POS-session close at midnight in
`Asia/Jakarta`. It attempts to close sessions for active stores and uses
`Promise.allSettled`, logging individual failures so one store does not prevent
the others from being processed.

## Module map

| Module          | Responsibilities                                                                                               |
| --------------- | -------------------------------------------------------------------------------------------------------------- |
| `auth`          | Login/registration, Redis-backed session authentication, global authentication/role/store-selection guards.    |
| `user`          | User profile data, administration, global roles and statuses; provisions the initial administrator on startup. |
| `store`         | Store lifecycle, memberships, selected-store API context, store-scoped catalog/stock/POS/invoice controllers.  |
| `inventory`     | Items, categories, bundle components, bins, and stock-ledger entries.                                          |
| `point-of-sale` | POS sessions, session opening/sold quantities, sales invoices and invoice lines.                               |
| `health`        | Startup and HTTP health checks for database, Redis, disk, and memory.                                          |

Entity and DTO definitions live next to their owning feature. Service
implementations contain business rules; controllers primarily map HTTP
requests to services.

## Working on this codebase

For AI coding agents and contributors:

1. Read this guide and the relevant controller, guard, DTO, service, and entity
   before changing a feature.
2. Treat source code as authoritative. In particular, verify route decorators
   and guards rather than inferring permissions from names or Swagger text.
3. Preserve the distinction between global `UserRole`, per-store `StoreRole`,
   authenticated session, and selected-store context.
4. Keep inventory/session/sales mutations consistent with the existing
   transaction and stock-ledger behavior.
5. Update this guide whenever routes, access rules, feature behavior, or
   background jobs change.
6. Run `bun run build` after TypeScript changes. Run focused tests where
   available; `bun run test` runs the test suite.
7. Run live API coverage with `bun run test:e2e:api`; configure
   `API_BASE_URL`, `E2E_ADMIN_USERNAME`, `E2E_ADMIN_PASSWORD`,
   `E2E_USER_USERNAME`, and `E2E_USER_PASSWORD` in the environment or `.env`.
   The API E2E Jest config loads `.env` before the suite. It creates uniquely
   named fixtures and soft-deletes its test stores after execution.
   See [the live API E2E guide](../test/TESTING.md) for prerequisites, fixture
   order, cleanup behavior, and coverage limits.

Useful source entry points:

- Bootstrap and HTTP/security configuration: `src/main.ts`
- Global module and throttling configuration: `src/app.module.ts`
- Auth routes and guards: `src/modules/auth/`
- Store routes and store-specific guards: `src/modules/store/`
- Inventory routes and services: `src/modules/inventory/`
- Sales/POS behavior and scheduled session close: `src/modules/point-of-sale/`
- User administration: `src/modules/user/`
- Health checks: `src/modules/health/`
