import { IncludeOptions } from "sequelize";
import { ItemCategory } from "../../entities/item-category.entity";

export function GET_ITEM_CATEGORY_INCLUDE(): IncludeOptions {
  return {
    model: ItemCategory,
    required: false,
    attributes: ['name']
  }
}
