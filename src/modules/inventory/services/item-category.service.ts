import { Injectable, NotFoundException } from "@nestjs/common";
import { BaseService } from "../../../common/base/base.service";
import { ItemCategory } from "../entities/item-category.entity";
import { InjectModel } from "@nestjs/sequelize";

@Injectable()
export class ItemCategoryService extends BaseService<ItemCategory> {
  constructor(
    @InjectModel(ItemCategory) protected model: typeof ItemCategory
  ) {
    super(model);
  }

  async removeForStore(id: string, storeId: string): Promise<boolean> {
    const deletedCount = await this.model.destroy({
      where: { id, storeId },
    });

    if (!deletedCount) {
      throw new NotFoundException('ItemCategory not found');
    }

    return true;
  }
}
