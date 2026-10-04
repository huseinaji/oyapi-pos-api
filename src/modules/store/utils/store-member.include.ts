import { IncludeOptions } from "sequelize";
import { StoreMember } from "../entities/store-member.entity";

export function GET_STORE_MEMBER_INCLUDE(): IncludeOptions {
  return {
    model: StoreMember,
    required: false,
    attributes: { exclude: ['createdAt', 'updatedAt'] }
  }
}
