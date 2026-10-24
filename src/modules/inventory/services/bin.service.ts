import { Injectable, NotFoundException } from '@nestjs/common';
import { TxOptions } from '../../../common/base/base.service';
import { Bin } from '../entities/bin.entity';
import { InjectModel } from '@nestjs/sequelize';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { BaseBinDto } from '../dto/bin/base-bin.dto';
import { GET_ITEM_INCLUDE } from '../utils/includes/item.include';

interface CreateBinInput {
  itemId: string;
  qty: number;
  storeId: string;
}

@Injectable()
export class BinService {
  constructor(@InjectModel(Bin) protected model: typeof Bin) {}

  async updateOrCreateBin(data: CreateBinInput, options?: TxOptions) {
    const entity = await this.model.findOne({
      where: {
        itemId: data.itemId,
        storeId: data.storeId,
      },
      ...options,
    });

    if (entity) {
      return await entity.update(
        { qty: data.qty, reservedQty: 0 },
        options,
      );
    }

    return await this.model.create<Bin>(
      {
        itemId: data.itemId,
        qty: data.qty,
        storeId: data.storeId,
      },
      options,
    );
  }

  async getStock(itemId: string, options?: TxOptions): Promise<number> {
    return (
      (await this.model.findOne({ where: { itemId }, ...options }))
        ?.actualQty || 0
    );
  }

  async findAndCountAll(
    query: Partial<BaseBinDto>,
    pagination?: PaginationDto,
  ) {
    return this.model.findAndCountAll({
      order: [['createdAt', 'DESC']],
      where: {
        ...query,
      },
      include: [
        {
          ...GET_ITEM_INCLUDE(),
          required: true,
        },
      ],
      ...(pagination?.getPagination() ?? {}),
    });
  }

  async updateReservedQty(
    itemId: string,
    reservedQty: number,
    options?: TxOptions,
  ) {
    return await this.model.update(
      {
        reservedQty,
      },
      {
        where: {
          itemId,
        },
        ...options,
      },
    );
  }
}
