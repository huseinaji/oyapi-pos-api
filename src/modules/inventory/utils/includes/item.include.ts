import { IncludeOptions } from "sequelize";
import { Item } from "../../entities/item.entity";

export function GET_ITEM_INCLUDE(): IncludeOptions {
  return {
    model: Item,
    required: false,
    attributes: ['name', 'description', 'uom', 'sellingPrice']
  }
}
