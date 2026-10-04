import { FindAttributeOptions, IncludeOptions } from "sequelize";
import { SalesInvoiceItem } from "../entities/sales-invoice-item.entity";
import { GET_ITEM_INCLUDE } from "../../inventory/utils/includes/item.include";

const SIAttributes: FindAttributeOptions = {
  exclude: [
    'createdAt',
    'updatedAt'
  ]
}
export function GET_SALESINVOICEITEM_INCLUDE(): IncludeOptions {
  return {
    model: SalesInvoiceItem,
    required: false,
    attributes: SIAttributes,
    include: [GET_ITEM_INCLUDE()]
  }
}
