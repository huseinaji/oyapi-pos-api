import { BadRequestException, ConflictException } from "@nestjs/common";
import {
  ForeignKeyConstraintError,
  UniqueConstraintError,
  ValidationError,
} from "sequelize";

export function HandleSequelizeErrors() {
  return function (
    _target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        if (error instanceof UniqueConstraintError) {
          throw new ConflictException(
            error.errors.map((item) => ({
              field: item.path,
              message: error.parent.message ?? item.message,
              value: item.value,
            })),
          );
        }

        if (error instanceof ValidationError) {
          throw new BadRequestException(
            error.errors.map((item) => ({
              field: item.path,
              message: item.message,
              value: item.value,
            })),
          );
        }

        if (error instanceof ForeignKeyConstraintError) {
          console.log(error)
          throw new BadRequestException({
            message: "Referenced resource does not exist",
            field: error.fields ?? error.index,
            error: error.name
          });
        }

        throw error;
      }
    };

    return descriptor;
  };
}
