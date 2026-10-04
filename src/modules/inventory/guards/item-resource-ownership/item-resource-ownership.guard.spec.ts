import { ItemResourceOwnershipGuard } from './item-resource-ownership.guard';

describe('ItemResourceOwnershipGuard', () => {
  it('should be defined', () => {
    expect(new ItemResourceOwnershipGuard()).toBeDefined();
  });
});
