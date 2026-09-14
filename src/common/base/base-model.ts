import { Column, DataType, Model } from 'sequelize-typescript';
import { ulid } from 'ulid';

export abstract class BaseModel extends Model {
  @Column({
    type: DataType.STRING(26),
    primaryKey: true,
    defaultValue: () => ulid(),
  })
  declare id: string;
}
