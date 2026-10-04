import { IncludeOptions } from 'sequelize';
import { ItemBundleComponent } from '../../entities/item-bundle-component.entity';
import { GET_ITEM_INCLUDE } from './item.include';

export function GET_ITEMBUNDLECOMPONENT_INCLUDE(): IncludeOptions {
  return {
    model: ItemBundleComponent,
    required: false,
    attributes: ['componentItemId', 'qty'],
    include: [
      {
        ...GET_ITEM_INCLUDE(),
        as: 'componentItem'
      }
    ],
  };
}
