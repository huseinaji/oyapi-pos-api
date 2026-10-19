---
name: nestjs-module-scaffolding
description: "Use when generating NestJS/Sequelize modules and complete per-entity boilerplate in this backend, including multi-entity modules, DTOs, services, controllers, module wiring, entities, and migrations."
---

# NestJS Module Scaffolding

Generate complete, repository-consistent NestJS modules for the ChannelQ Platform backend. Treat the requested behavior and schema as authoritative; do not copy a neighboring module's business rules blindly.

## When to Use

- Creating a new module, model/resource, or CRUD endpoint set.
- Scaffolding a Sequelize entity with DTOs, service, controller, module registration, include helpers, types, or migration.
- Extending an existing module with a new persisted resource or CRUD surface.
- Generating features in a module that owns or registers multiple Sequelize entities/tables.

## Workflow

1. **Clarify the contract only when needed.**
   - Identify resource name, fields/types, required versus nullable fields, relationships, unique constraints, access rules, and desired endpoints from the request and repository context.
   - Ask one focused question if a missing decision materially affects the API or schema. Otherwise make only assumptions supported by nearby code and state them.
2. **Inspect repository prior art before generating.**
   - For BaseService, options, pagination, and removal behavior, read `src/common/base/base.service.ts` and `src/common/base/base-abstract.service.ts`.
   - Compare a simple CRUD resource with `src/modules/credit-system/` and a relationship/domain-heavy resource with `src/modules/social/polling/`.
   - Check neighboring entities, DTOs, controllers, include helpers, types, module wiring, tests, and migrations. Follow the closest pattern for the requested behavior.
   - For an existing or multi-table module, inspect its `SequelizeModule.forFeature([...])` registrations and entity files to inventory its entities/tables. Trace each relevant entity to its services, DTOs, controllers, relations, and migrations; the registration list is an inventory, not an instruction to expose every table as CRUD.
   - Decide the generation scope per entity/table from the requested feature and existing domain behavior. Treat support/join/usage/ledger entities as distinct persistence models, but do not create public endpoints for them unless explicitly requested or clearly established by the existing API. If the request only names a broad module and multiple tables could reasonably be targeted, ask which table/feature to scaffold rather than guessing.
   - Confirm the migration path and naming convention from `.sequelizerc`; migrations are under `src/infrastructure/database/migrations/migrations/`.
3. **Define the files and API shape.**
   - Place the resource under the correct domain in `src/modules/<domain>/<resource>/` or follow the existing module's layout.
   - For standalone resources, use the local conventions for `entities/`, `dto/`, `services/`, `controllers/`, and `utils/`. Avoid creating empty or unused files.
   - For a selected entity in an existing multi-entity module, scope generated artifacts to that entity/feature, then update the shared module registration (models, providers, controllers, imports/exports) without duplicating or removing unrelated registrations.
   - When creating a new module/resource, start with the Nest CLI resource schematic using `npx nest g resource <module-name> --type rest --no-spec --crud false` (or the equivalent configured local `nest` command). Supply the name as the positional argument, not `--name`. This selects REST, disables spec generation, and explicitly disables generated CRUD entry points; then adapt the scaffold to the requested API and repository patterns.
   - Do not accept or retain the schematic's generated CRUD endpoints/DTOs as the default API. Add only the endpoints and artifacts called for by the request. If the Nest CLI version does not support `--crud false`, use its interactive prompt and answer REST API, no spec files, and no CRUD entry points.
   - For a new module where the request lists multiple entities, treat every listed entity as in-scope and generate its boilerplate in the same pass: entity, applicable base/create/update/query DTOs, entity-specific service and controller, and shared module registration. Run the Nest resource schematic once for the module, then adapt its module-level scaffold to the repository's per-entity layout. Do not stop after generating only the first entity or the Nest CLI skeleton.
   - If the request gives entity names but no fields, create compiling entity/DTO/service/controller shells using only the repository's established server-managed identifier/timestamp conventions; do not invent business columns, relations, endpoints, permissions, or migrations. When fields are supplied, generate DTO validation, entity columns, and schema migration consistently from those fields. Ask only if a missing decision prevents a safe or compiling scaffold.
   - Decide whether an endpoint is ordinary CRUD or requires domain-specific orchestration, transactions, authorization, events, or scheduled work. Keep these behaviors in the appropriate service/controller pattern.
4. **Generate the persistence model and DTO family.**
   - **Entity:** use `sequelize-typescript` model decorators and align table/column names, nullability, defaults, indexes, primary keys, timestamps, and associations with the migration and neighboring entities. Follow the project's identifier conventions (including ULID defaults where appropriate).
   - **Base DTO:** define the shared field shape with accurate `class-validator` constraints and `@nestjs/swagger` metadata. Do not expose server-managed fields as client-writable just because they exist on the entity.
   - **Create DTO:** derive an explicit allow-list from the base using `PickType` and, where useful, `IntersectionType`/`PartialType`. Include only client-supplied create fields.
   - **Update DTO:** use `PartialType` of the appropriate create/allow-listed DTO, or a narrower `PickType` first when fields are immutable. Do not make identifiers or protected fields mutable.
   - **Delete DTO:** create one only if the endpoint accepts a body with validated fields. If deletion is by route `:id`, follow `BaseService.remove({ id, user })` and do not invent an unnecessary DTO.
   - **Query DTO:** use `PartialType` and omit identifiers or sensitive fields as appropriate. Keep pagination consistent with `PaginationDto`; do not duplicate pagination fields without a local reason.
   - Use `@nestjs/swagger` mapped types so validation and API schema metadata remain inherited. For nested objects/arrays, follow local `class-transformer` and `class-validator` patterns.
5. **Generate service, include utilities, types, and controller.**
   - For standard persistence operations, make the service extend `BaseService<Entity>`, inject the model with `@InjectModel(Entity)`, and pass it to `super(model)`. Use the shared `CreateOptions`, `FindAllOptions`, `FindOneOptions`, `UpdateOptions`, `RemoveOptions`, and `TxOptions` types where their semantics fit.
   - Override base operations only when the resource needs different filtering, sorting, attributes, includes, transaction handling, or business behavior. Preserve useful base behavior such as not-found and empty-update validation.
   - Put reusable Sequelize associations in `utils/<resource>.include.ts`; return typed `IncludeOptions` and use the repository's existing include-function naming convention. Do not add an include helper if the resource has no reusable include.
   - Put resource-specific enums and shared types in `utils/<resource>.types.ts` (or the established local filename). Do not put runtime behavior or unrelated types there.
   - Add controller routes only for requested/established operations. Use existing versioned route, decorator, authentication, authorization, request-user, pagination, Swagger, and response conventions. Do not expose admin operations without matching guards/roles.
   - Wire entities through `SequelizeModule.forFeature`, and register providers, controllers, imports, and exports in the feature module. Update the owning parent module only if this repository's module structure requires it.
6. **Generate a migration only for a database schema change.**
   - From the repository root, use the Sequelize CLI generator to create the timestamped migration file:
     - New table: `npx sequelize-cli migration:generate --name create-<table-name>-table`
     - Add a field: `npx sequelize-cli migration:generate --name add-<field-name>-<table-name>-table`
   - Use kebab-case names and the `create-...-table` / `add-...-table` convention. For other schema changes, use a concise `add`, `remove`, `change`, or `rename` prefix followed by the affected field/table. Check for an existing migration first to avoid duplicates.
   - Edit the generated file under `src/infrastructure/database/migrations/migrations/`; do not manually invent its timestamp or create a second migration file.
   - Make `up` match the entity exactly, including snake_case column names, primary/foreign keys, nullability, defaults, indexes, charset, and collation. Add foreign-key actions intentionally.
   - Implement a meaningful reversible `down` operation and inspect neighboring migrations for dialect-specific conventions.
   - Do not run `sequelize-cli db:migrate`, undo migrations, or apply schema changes to a live/shared database without explicit user approval.
7. **Wire and verify end to end.**
   - Update registration/import surfaces, tests, and documentation that are directly affected.
   - Check that routes use the intended DTOs, services consume the correct option shapes, entity and migration agree, and module dependencies are resolvable.
   - Run the narrowest relevant tests first, then the repository build or type check when appropriate. Report generated files, verification results, and any assumptions.

## Repository References

- `src/modules/credit-system/`: BaseService-inheriting services, CRUD-adjacent DTOs, controller/module composition, include helpers, enums/types, and Sequelize entities.
- `src/modules/social/polling/`: multi-entity module inventory and registration, nested DTOs, custom service logic, transactions, related entities, include helpers, and module composition. Use it to distinguish module-wide entity registration from per-feature endpoint scope.
- `src/common/base/base.service.ts`: shared create/find/update/remove behavior and option interfaces.
- `src/infrastructure/database/migrations/migrations/`: Sequelize CLI schema migrations.

## Guardrails

- Prefer existing shared helpers and patterns over new abstractions or a parallel CRUD framework.
- Do not generate every listed artifact mechanically when it has no use; explain omissions such as no delete-body DTO or no include helper.
- Do not silently invent field semantics, database constraints, endpoint permissions, or response contracts.
- Do not edit unrelated files or rewrite a neighboring module as part of scaffolding.
- Keep imports, formatting, naming, and API compatibility aligned with nearby code.
- For a one-shot interactive scaffold invocation, use the workspace prompt [`/modgenerate`](../prompts/modgenerate.prompt.md), which applies this workflow end to end.
