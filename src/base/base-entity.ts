import { BeforeInsert, CreateDateColumn, Generated, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { ulid } from 'ulid';

export abstract class BaseEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 26,
  })
  id: string;

  @BeforeInsert()
  generateId() {
    this.id ??= ulid();
  }

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}