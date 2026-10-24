import { BeforeCreate, BeforeDestroy, BeforeUpdate, Column, DataType, DefaultScope, HasMany, Table } from 'sequelize-typescript';
import { BaseModel } from '../../../common/base/base-model';
import { UserRole, UserStatus } from '../utils/user.types';
import { StoreMember } from '../../store/entities/store-member.entity';

@Table({
  timestamps: true,
  paranoid: true,
})
@DefaultScope(() => ({
  attributes: { exclude: ['password'] },
}))
export class User extends BaseModel {
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare username: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare password: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: UserRole.USER,
  })
  declare role: UserRole;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: UserStatus.ACTIVE,
  })
  declare status: UserStatus;

  @Column({
    type: DataType.DATE,
  })
  declare lastLogin: string;

  @HasMany(() => StoreMember)
  declare storeMembers: StoreMember[]

  @BeforeDestroy
  static async setStatusInactive(instance: User) {
    await instance.update({ status: UserStatus.INACTIVE })
  }

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User): Promise<void> {
    if (!instance.changed('password')) {
      return;
    }

    instance.password = await Bun.password.hash(instance.password, {
      algorithm: "argon2id",
      memoryCost: 65_536,
      timeCost: 3,
    })
  }
}
