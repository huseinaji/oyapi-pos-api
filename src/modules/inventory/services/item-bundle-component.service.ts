import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { ItemBundleComponent } from "../entities/item-bundle-component.entity";
import { TxOptions } from "../../../common/base/base.service";
import { CreateItemBundleComponentDto } from "../dto/item-bundle-component/create-item-bundle-component.dto";

@Injectable()
export class ItemBundleComponentService {
  constructor(
    @InjectModel(ItemBundleComponent) private model: typeof ItemBundleComponent
  ) {}

  async findOne(id: string) {
    const result = await this.model.findByPk(id);
    if (!result) {
      throw new NotFoundException('item component not found');
    }

    return result;
  }

  create(data: CreateItemBundleComponentDto, itemId: string) {
    return this.model.create({
      ...data,
      itemId
    })
  }

}