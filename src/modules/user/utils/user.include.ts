import { FindAttributeOptions, IncludeOptions } from "sequelize";
import { User } from "../entities/user.entity";

const UserAttributes: FindAttributeOptions = {
  exclude: [
    'password',
    'createdAt',
    'updatedAt',
    'deletedAt'
  ]
}
export function GET_USER_INCLUDE(): IncludeOptions {
  return {
    model: User,
    required: false,
    attributes: UserAttributes,
  }
}
