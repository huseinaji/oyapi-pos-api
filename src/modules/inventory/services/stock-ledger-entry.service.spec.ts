import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { StockLedgerEntry } from '../entities/stock-ledger-entry.entity';
import {
  LedgerDirection,
  StockLedgerEntryStatus,
} from '../utils/types/stock-ledger-entry.type';
import { BinService } from './bin.service';
import { StockLedgerEntryService } from './stock-ledger-entry.service';

describe('StockLedgerEntryService', () => {
  let service: StockLedgerEntryService;
  let model: {
    findAll: ReturnType<typeof mock>;
    create: ReturnType<typeof mock>;
    findAndCountAll: ReturnType<typeof mock>;
  };
  let binService: {
    updateOrCreateBin: ReturnType<typeof mock>;
  };

  beforeEach(async () => {
    model = {
      findAll: mock(async () => []),
      create: mock(async () => ({ id: 'ledger-1' })),
      findAndCountAll: mock(async () => ({ rows: [], count: 0 })),
    };
    binService = {
      updateOrCreateBin: mock(async () => undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockLedgerEntryService,
        {
          provide: getModelToken(StockLedgerEntry),
          useValue: model,
        },
        { provide: BinService, useValue: binService },
      ],
    }).compile();

    service = module.get(StockLedgerEntryService);
  });

  describe('calculateBalanceAfter', () => {
    it('subtracts outbound quantity from the latest active balance', async () => {
      model.findAll = mock(async () => [{ balanceAfter: 12 }]);

      const balance = await service.calculateBalanceAfter({
        itemId: 'item-1',
        qty: 5,
        ledgerDirection: LedgerDirection.OUT,
      } as never);

      expect(balance).toBe(7);
      expect(model.findAll).toHaveBeenCalledWith({
        where: {
          itemId: 'item-1',
          status: StockLedgerEntryStatus.ACTIVE,
        },
        order: [['createdAt', 'DESC']],
      });
    });

    it('adds inbound quantity to the latest active balance', async () => {
      model.findAll = mock(async () => [{ balanceAfter: 12 }]);

      const balance = await service.calculateBalanceAfter({
        itemId: 'item-1',
        qty: 5,
        ledgerDirection: LedgerDirection.IN,
      } as never);

      expect(balance).toBe(17);
    });

    it('starts at zero when there is no previous active balance', async () => {
      const balance = await service.calculateBalanceAfter({
        itemId: 'item-1',
        qty: 5,
        ledgerDirection: LedgerDirection.OUT,
      } as never);

      expect(balance).toBe(-5);
    });
  });

  describe('create', () => {
    it('creates a ledger entry and synchronizes the bin using the calculated balance', async () => {
      const dto = {
        itemId: 'item-1',
        qty: 5,
        ledgerDirection: LedgerDirection.IN,
        storeId: 'store-1',
      };
      const options = { transaction: { id: 'transaction-1' } } as never;
      model.findAll = mock(async () => [{ balanceAfter: 12 }]);
      const ledgerEntry = { id: 'ledger-1' };
      model.create = mock(async () => ledgerEntry);

      const result = await service.create({ createDto: dto }, options);

      expect(result).toBe(ledgerEntry);
      expect(model.create).toHaveBeenCalledWith(
        { ...dto, balanceAfter: 17 },
        options,
      );
      expect(binService.updateOrCreateBin).toHaveBeenCalledWith(
        { itemId: 'item-1', qty: 17, storeId: 'store-1' },
        options,
      );
    });

    it('does not synchronize the bin when ledger creation fails', async () => {
      const error = new Error('ledger write failed');
      model.create = mock(async () => {
        throw error;
      });

      await expect(
        service.create({
          createDto: {
            itemId: 'item-1',
            qty: 5,
            ledgerDirection: LedgerDirection.IN,
            storeId: 'store-1',
          } as never,
        }),
      ).rejects.toBe(error);

      expect(binService.updateOrCreateBin).not.toHaveBeenCalled();
    });
  });

  describe('findAndCountAll', () => {
    it('filters results, includes item details, sorts newest first, and applies pagination', async () => {
      const result = { rows: [{ id: 'ledger-1' }], count: 1 };
      model.findAndCountAll = mock(async () => result);
      const queryDto = { itemId: 'item-1' };
      const pagination = Object.assign(new PaginationDto(), {
        page: 2,
        limit: 10,
      });

      const response = await service.findAndCountAll(
        { queryDto },
        pagination,
      );

      expect(response).toBe(result);
      expect(model.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: queryDto,
          order: [['createdAt', 'DESC']],
          limit: 10,
          offset: 10,
        }),
      );
      expect(
        (model.findAndCountAll as ReturnType<typeof mock>).mock.calls[0][0]
          .include,
      ).toHaveLength(1);
    });

    it('omits pagination when none is provided', async () => {
      await service.findAndCountAll({ queryDto: { storeId: 'store-1' } });

      expect(model.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { storeId: 'store-1' },
          order: [['createdAt', 'DESC']],
        }),
      );
    });
  });
});
