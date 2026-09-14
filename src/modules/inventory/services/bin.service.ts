import { Injectable } from "@nestjs/common";
import { BaseService, TxOptions } from "../../../common/base/base.service";
import { Bin } from "../entities/bin.entity";
import { InjectModel } from "@nestjs/sequelize";

@Injectable()
export class BinService extends BaseService<Bin> {
  constructor(@InjectModel(Bin) protected model: typeof Bin) {
    super(model);
  }

  async updateOrCreateBin(itemId: string, stockValue: number, options?: TxOptions) {
    const entity = await this.model.findOne({ where: { itemId }, ...options });

    if (entity) {
      return await entity.update({ stockValue }, options)
    }

    return await this.model.create({
      itemId,
      stockValue
    }, options);
  }

  async checkStock(itemId: string, options?: TxOptions): Promise<number> {
    return (await this.model.findOne({ where: { itemId }, ...options }))?.stockValue || 0;
  }
}
