import { Controller, Get, Param, Patch, Query, Req } from "@nestjs/common";
import { SalesInvoiceService } from "../services/sales-invoice.service";
import { accessTokenPayload } from "../../auth/utils/auth.type";
import { QuerySalesInvoiceDto } from "../dto/query-sales-invoice.dto";
import { PaginationDto } from "../../../common/dto/pagination.dto";
import { ApiOperation } from "@nestjs/swagger";

@Controller({ path: 'invoices', version: '1' })
export class SalesInvoiceController {
  constructor(
    private salesInvoiceService: SalesInvoiceService,
  ) { }

  @ApiOperation({ description: 'GET invoice data by id' })
  @Get(':id')
  getByInvoiceId(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const user = req['user'] as accessTokenPayload;
    return this.salesInvoiceService.findOne({ id, user });
  }

  @ApiOperation({ description: 'GET ALL invoice data' })
  @Get()
  getAllInvoices(
    @Req() req: Request,
    @Query() query: QuerySalesInvoiceDto,
    @Query() pagination: PaginationDto
  ) {
    const user = req['user'] as accessTokenPayload;
    return this.salesInvoiceService.findAndCountAll({ queryDto: query, user }, pagination);
  }

  @ApiOperation({ summary: 'Set Status Complete' })
  @Patch(':id/complete')
  setStatusComplete(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const user = req['user'] as accessTokenPayload;

    return this.salesInvoiceService.setStatusCompleted(id, user);
  }
}
