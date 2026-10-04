import { IncludeOptions } from "sequelize";
import { Bin } from "../../entities/bin.entity";

const BinAttributes: (keyof Bin)[] = ['actualQty', 'reservedQty', 'uom'];

export function GET_BIN_INCLUDE(): IncludeOptions {
  return {
    model: Bin,
    required: false,
    attributes: BinAttributes,
  }
}
