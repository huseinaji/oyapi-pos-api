import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole, UserStatus } from "../utils/user.types";
import { BaseEntity } from "../../../base/base-entity";

@Entity()
export class User extends BaseEntity {
  @Column({unique: true})
  username: string;
  @Column({unique: true})
  email: string;
  @Column({select: false})
  password: string;
  @Column({
    type: 'varchar',
    default: UserRole.USER
  })
  role: string;
  @Column({
    type: 'varchar',
    default: UserStatus.ACTIVE
  })
  status: string;
}
