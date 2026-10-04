import { IncludeOptions } from "sequelize";
import { PosSessionEntryItem } from "../entities/pos-session-entry-item.entity";
import { GET_ITEM_INCLUDE } from "../../inventory/utils/includes/item.include";
import { GET_BIN_INCLUDE } from "../../inventory/utils/includes/bin.include";

const posSessionEntryItemAttributes: (keyof PosSessionEntryItem)[] = ['itemId', 'openingQty', 'closingQty', 'soldQty'];

export function GET_POSSESSION_ENTRY_ITEM_INCLUDE(): IncludeOptions {
  return {
    model: PosSessionEntryItem,
    required: false,
    attributes: posSessionEntryItemAttributes,
    include: [
      {
        ...GET_ITEM_INCLUDE(),
        attributes: ['id', 'name', 'description', 'uom', 'sellingPrice', 'type', 'isMaintainStock'],
        include: [
          GET_BIN_INCLUDE()
        ]
      }
    ]
  }
}
