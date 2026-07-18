import { BaseEntity } from '../../../base/base-entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Product extends BaseEntity {
  @Column({ unique: true })
  name: string;
  @Column({ type: 'varchar' })
  category: string;
  @Column({ type: 'varchar' })
  uom: string;
  @Column({ type: 'int' })
  basePrice: number;
  @Column({ type: 'int' })
  sellingPrice: number;
}
