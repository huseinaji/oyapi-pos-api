import { IncludeOptions } from 'sequelize';
import { Store } from '../entities/store.entity';

export function GET_STORE_INCLUDE(): IncludeOptions {
  return {
    model: Store,
    required: false,
    attributes: ['name', 'imageUrl', 'address', 'phone'],
  };
}
