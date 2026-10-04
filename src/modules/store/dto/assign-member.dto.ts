import { IsString } from "class-validator";

export class AssignMmeberStoreDto {
  @IsString()
  userId: string;
}
