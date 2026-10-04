import { OmitType } from '@nestjs/swagger';
import { CreatePOSTransactionDto } from '../../point-of-sale/dto/create-transaction.dto';

export class CreateStorePOSDto extends OmitType(CreatePOSTransactionDto, [
  'storeId',
  'posSessionId'
]) {}
