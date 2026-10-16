import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateStoreItemCategoryDto {
  @ApiProperty({ type: String, description: 'Name of the new item category', example: 'Beverages' })
  @IsString()
  name: string
}
