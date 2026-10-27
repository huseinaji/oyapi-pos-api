import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ItemBundleComponent } from '../entities/item-bundle-component.entity';
import { CreateItemBundleComponentDto } from '../dto/item-bundle-component/create-item-bundle-component.dto';
import { ItemService } from './item.service';

@Injectable()
export class ItemBundleComponentService {
  constructor(
    @InjectModel(ItemBundleComponent) private model: typeof ItemBundleComponent,
    private readonly itemService: ItemService,
  ) {}

  async create(
    data: CreateItemBundleComponentDto,
    itemId: string,
    storeId: string,
  ) {
    await this.itemService.findOneForStore(itemId, storeId);
    await this.itemService.findOneForStore(data.componentItemId, storeId);

    return this.model.create({
      ...data,
      itemId,
    });
  }
}
