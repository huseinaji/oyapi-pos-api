import { BadRequestException, Injectable, UnprocessableEntityException } from "@nestjs/common";
import { SalesInvoiceItem } from "../entities/sales-invoice-item.entity";
import { InjectModel } from "@nestjs/sequelize";
import { BaseService, TxOptions } from "../../../common/base/base.service";
import { CreateSalesInvoiceItemDto } from "../dto/create-sales-invoice-item.dto";
import { Item } from "../../inventory/entities/item.entity";
import { ItemService } from "../../inventory/services/item.service";

@Injectable()
export class SalesInvoiceItemService extends BaseService<SalesInvoiceItem> {
  constructor(
    @InjectModel(SalesInvoiceItem) protected readonly model: typeof SalesInvoiceItem,
    private readonly itemService: ItemService,
  ) {
    super(model);
  }

  private calculateItemAmount(data: CreateSalesInvoiceItemDto, item: Item) {
    return data.qty * item.sellingPrice;
  }

  private async validateStock(dto: CreateSalesInvoiceItemDto, options?: TxOptions) {
    const currentStock = await this.itemService.checkStock(dto.itemId, options);

    if ((currentStock - dto.qty) >= 0) return true;

    throw new UnprocessableEntityException('Insufficient Stock');
  }


  async generateFromSI(invoiceId: string, items: CreateSalesInvoiceItemDto[], options?: TxOptions) {
    const records = await Promise.all(
      items.map(async item => {
        const itemData = await this.itemService.findOne({ id: item.itemId });

        if (!itemData.isMaintainStock) {
          throw new BadRequestException('Non maintain stock item cannot be use on POS');
        }

        await this.validateStock(item);

        const amount = this.calculateItemAmount(item, itemData);
        return { ...item, salesInvoiceId: invoiceId, amount }
      })
    )

    return await this.model.bulkCreate(records, options);
  }
}
