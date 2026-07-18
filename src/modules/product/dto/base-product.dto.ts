import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { ProductCategory, ProductUOM } from "../utils/product.types";

export class BaseProductDto {
  @ApiProperty()
  @IsString()
  name: string;
  
  @ApiProperty()
  @IsEnum(ProductCategory)
  category: ProductCategory;
  
  @ApiProperty()
  @IsEnum(ProductUOM)
  uom: ProductUOM;
  
  @ApiProperty()
  @IsNumber()
  basePrice: number;
  
  @ApiProperty()
  @IsNumber()
  sellingPrice: number;
}