import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from '../../../common/base/base-model';
import { User } from '../../user/entities/user.entity';

@Table({
  tableName: 'file_storages',
  timestamps: true,
})
export class FileStorage extends BaseModel {
  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING(26),
    allowNull: true,
  })
  declare userId: string | null;

  @BelongsTo(() => User, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  declare user: User | null;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare objectKey: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare mimeType: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare status: string;
}
