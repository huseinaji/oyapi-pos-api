---
name: modulegen
user-invocable: true
description: "Generate a complete NestJS/Sequelize module and boilerplate for every listed entity in this repository."
argument-hint: "generate module <name> entity <EntityOne>, <EntityTwo> [fields, relations, endpoints]"
agent: "agent"
---

Use the [`nestjs-module-scaffolding` skill](../skills/nestjs-module-scaffolding/SKILL.md) and carry out the requested module/resource generation end to end in this workspace.

Interpret `generate` and the remaining text as the specification. Inspect the existing code and follow the skill's repository patterns. For a new module, treat every explicitly listed entity as in scope and generate the complete applicable boilerplate for each in one run: entity, base/create/update/query DTOs, entity-specific service and controller, and module registration. Run the Nest CLI resource schematic once for the module using `npx nest g resource <module-name> --type rest --no-spec --crud false`, then adapt its skeleton; do not stop at the CLI output or generate its default CRUD routes. In an existing module, inventory all entities registered by `SequelizeModule.forFeature` and inspect the related services, DTOs, controllers, and relations. Generate only for requested entities/features, not automatically for every registered table, and preserve unrelated registrations.

If entity names are supplied without fields, still generate compiling per-entity shells based on repository conventions, using only standard server-managed identifiers/timestamps; do not invent business columns, relations, routes, permissions, or migrations. If fields are supplied, propagate them consistently through entity, DTOs, service/controller needs, and migration. Add only explicitly requested endpoints; no CRUD routes by default. Ask a focused question only when missing information prevents a safe or compiling result.

When creating a new module/resource, begin with `npx nest g resource <module-name> --type rest --no-spec --crud false` (use the name as a positional argument, not `--name`). Then adapt the generated skeleton to the requested API; do not keep or add generated CRUD entry points unless the user requests them.

Generate applicable DTOs, Sequelize entities, `BaseService`-based services, controllers, include utilities, types, module registration, tests, and migrations; do not omit an explicitly listed entity or create artifacts that are not applicable to the requested API.

For a required schema migration:

1. Check that a matching migration does not already exist.
2. Run the Sequelize CLI generator from the repository root using kebab-case names:
   - New table: `npx sequelize-cli migration:generate --name create-<table-name>-table`
   - Added field: `npx sequelize-cli migration:generate --name add-<field-name>-<table-name>-table`
3. Edit the generated migration file to implement reversible `up` and `down` operations consistent with the entity and neighboring migrations.

Do not apply or undo migrations. Do not stop after proposing a plan: implement the requested changes, run the narrowest relevant verification, and summarize files changed and results. If required behavioral or schema information is missing and cannot be safely inferred from the request or codebase, ask one focused question before making that decision.
