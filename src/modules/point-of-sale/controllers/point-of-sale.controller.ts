import { Body, Controller, Post, Req } from '@nestjs/common';
import { accessTokenPayload } from '../../auth/utils/auth.type';
import { PointOfsaleService } from '../services/point-of-sale.service';
import { CreatePOSTransactionDto } from '../dto/create-transaction.dto';

@Controller({ path: 'pos', version: '1' })
export class PointOfSaleController {
  constructor(private readonly posService: PointOfsaleService) {}

  @Post('transaction')
  createTransaction(
    @Req() req: Request,
    @Body() data: CreatePOSTransactionDto,
  ) {
    const user = req['user'] as accessTokenPayload;
    return this.posService.createTransaction(data, user);
  }
}
