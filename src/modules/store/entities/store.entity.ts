import { Column, DataType, Table } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base/base-model';

@Table({
  timestamps: true,
  paranoid: true,
})
export class Store extends BaseModel {
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  declare name: string;
  @Column({
    type: DataType.STRING,
  })
  declare imageUrl: string;
  @Column({
    type: DataType.STRING,
  })
  declare address: string;
  @Column({
    type: DataType.STRING,
  })
  declare phone: string;
}
