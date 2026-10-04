import { BelongsTo, Column, DataType, ForeignKey, Table } from "sequelize-typescript";
import { BaseModel } from "../../../common/base/base-model";
import { Store } from "../../store/entities/store.entity";

@Table({
  timestamps: true,
})
export class ItemCategory extends BaseModel {
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @ForeignKey(() => Store)
  declare storeId: string;

  @BelongsTo(() => Store)
  declare store: Store;
}
