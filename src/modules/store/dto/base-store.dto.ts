import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsPhoneNumber, IsString } from "class-validator";
import { StoreStatus } from "../utils/store.types";

export class BaseStoreDto {
  @ApiProperty({ type: String, description: 'Store display name', example: 'Central Market' })
  @IsString()
  name: string;
  @ApiProperty({ type: String, description: 'URL of the store image', example: 'https://example.com/stores/central-market.png' })
  @IsString()
  imageUrl: string;
  @ApiProperty({ type: String, description: 'Store street address', example: '123 Main Street, Jakarta' })
  @IsString()
  address: string;
  @ApiProperty({ type: String, description: 'Store contact phone number in international format', example: '+6281234567890' })
  @IsPhoneNumber()
  phone: string;
  @ApiProperty({ enum: StoreStatus, enumName: 'StoreStatus', description: 'Current store status' })
  @IsEnum(StoreStatus)
  status: StoreStatus;
}
