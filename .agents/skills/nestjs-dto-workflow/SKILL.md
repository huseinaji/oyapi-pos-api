---
name: nestjs-dto-workflow
description: "Use when creating, updating, or reviewing NestJS request/response DTOs in this backend, especially DTOs using @nestjs/swagger mapped types, class-validator, class-transformer, or endpoint-specific variants such as create, update, query, and nested polling DTOs."
---

# NestJS DTO Workflow

Use this skill to implement DTO changes consistently with the ChannelQ Platform backend.

## When to Use

- Adding or changing request, response, query, or nested DTOs in `src/modules/**`.
- Creating endpoint-specific DTO variants from shared/base DTOs.
- Reviewing field validation, Swagger metadata, or DTO inheritance.

## Workflow

1. **Trace the existing contract before editing.**
   - Find the base/shared DTO and nearby DTOs for the same domain or endpoint.
   - Check the controller and service call sites to understand which fields are accepted, optional, transformed, or consumed.
   - Check existing tests and module conventions before introducing new patterns.
2. **Reuse shared DTOs and mapped types.**
   - Prefer the existing base DTO when fields are shared.
   - Use mapped types from `@nestjs/swagger` so inherited validation and API documentation metadata stay aligned:
     - `PickType` for an allow-listed subset.
     - `OmitType` to exclude fields clients must not supply.
     - `PartialType` for optional update fields.
     - `IntersectionType` when combining compatible DTO shapes.
   - Follow nearby conventions for `as const` on mapped-type key arrays.
   - Avoid duplicating a field definition if a mapped type expresses the contract correctly. Add or override a property only when endpoint-specific behavior requires it.
3. **Keep validation, transformation, and documentation accurate.**
   - Use `class-validator` decorators for input constraints and `class-transformer` for nested object transformation where needed.
   - For nested arrays/objects, follow local patterns for `@Type`, `@ValidateNested`, and array constraints.
   - Keep `@ApiProperty`/Swagger metadata truthful, including optionality, enum values, and collection types. Do not mark a field optional in documentation while keeping it required at runtime (or vice versa).
   - Preserve intentional null handling and conditional validation; do not treat `null` as equivalent to an omitted value without checking the contract.
4. **Respect the API boundary.**
   - Exclude server-managed identifiers and ownership fields from create DTOs unless the endpoint explicitly accepts them.
   - For update DTOs, make only the intended fields optional and preserve fields that are immutable or server-managed.
   - Avoid changing persistence/entity types as a shortcut for changing a request DTO.
5. **Verify the change.**
   - Review the final DTO alongside its base DTO and endpoint usage.
   - Run the narrowest relevant tests or type/build check available in the repository.
   - Report any contract assumptions that could not be confirmed from the code.

## Repository Patterns

- Domain DTOs live under `src/modules/**/dto/`; endpoint-specific DTOs may be grouped in feature subfolders such as `polling/`.
- Shared field validation and Swagger metadata are commonly declared on base DTO classes and inherited through `@nestjs/swagger` mapped types.
- Prefer the import style and formatting of neighboring files; existing files may use either quote style.
