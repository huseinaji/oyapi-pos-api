import { FindAttributeOptions, IncludeOptions } from "sequelize";
import { Bin } from "../entities/bin.entity";

const BinAttributes: FindAttributeOptions = ['itemId', 'stockValue', 'uom'];

export function GET_BIN_INCLUDE(): IncludeOptions {
  return {
    model: Bin,
    required: false,
    attributes: BinAttributes,
  }
}
