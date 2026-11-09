import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { Sequelize } from 'sequelize-typescript';
import { StockAdjustmentItem } from '../entities/stock-adjustment-item.entity';
import { StockAdjustment } from '../entities/stock-adjustment.entity';
import {
  LedgerDirection,
  LedgerReference,
} from '../utils/types/stock-ledger-entry.type';
import { StockAdjustmentType } from '../utils/types/stock-adjustment.type';
import { StockLedgerEntryService } from './stock-ledger-entry.service';
import { StockAdjustmentService } from './stock-adjustment.service';

describe('StockAdjustmentService', () => {
  let service: StockAdjustmentService;
  let adjustmentModel: {
    create: ReturnType<typeof mock>;
    findAndCountAll: ReturnType<typeof mock>;
    destroy: ReturnType<typeof mock>;
  };
  let adjustmentItemModel: {
    bulkCreate: ReturnType<typeof mock>;
  };
  let stockLedgerService: {
    create: ReturnType<typeof mock>;
  };
  let sequelize: {
    transaction: ReturnType<typeof mock>;
  };
  const transaction = { id: 'transaction-1' };

  beforeEach(async () => {
    adjustmentModel = {
      create: mock(async () => ({
        id: 'adjustment-1',
        get: () => ({ id: 'adjustment-1' }),
      })),
      findAndCountAll: mock(async () => ({ rows: [], count: 0 })),
      destroy: mock(async () => 1),
    };
    adjustmentItemModel = {
      bulkCreate: mock(async () => []),
    };
    stockLedgerService = {
      create: mock(async () => ({ id: 'ledger-1' })),
    };
    sequelize = {
      transaction: mock(
        async (callback: (tx: typeof transaction) => Promise<unknown>) =>
          callback(transaction),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockAdjustmentService,
        {
          provide: getModelToken(StockAdjustment),
          useValue: adjustmentModel,
        },
        {
          provide: getModelToken(StockAdjustmentItem),
          useValue: adjustmentItemModel,
        },
        {
          provide: StockLedgerEntryService,
          useValue: stockLedgerService,
        },
        { provide: Sequelize, useValue: sequelize },
      ],
    }).compile();

    service = module.get(StockAdjustmentService);
  });

  describe('create', () => {
    it('creates an adjustment, its items, and ledger entries in one transaction', async () => {
      const dto = {
        storeId: 'store-1',
        type: StockAdjustmentType.RECEIVE,
        remarks: 'Restock',
        items: [
          { itemId: 'item-1', qty: 4 },
          { itemId: 'item-2', qty: 7 },
        ],
      };
      const options = { transaction };
      const createdAt = new Date('2026-11-07T05:51:00.289Z');
      const adjustment = {
        id: 'adjustment-1',
        get: () => ({
          id: 'adjustment-1',
          type: dto.type,
          remarks: dto.remarks,
          storeId: dto.storeId,
          createdAt,
          updatedAt: createdAt,
        }),
      };
      adjustmentModel.create = mock(async () => adjustment);

      const result = await service.create(dto);

      const itemRecords = [
        { itemId: 'item-1', qty: 4, stockAdjustmentId: 'adjustment-1' },
        { itemId: 'item-2', qty: 7, stockAdjustmentId: 'adjustment-1' },
      ];
      expect(sequelize.transaction).toHaveBeenCalledTimes(1);
      expect(adjustmentModel.create).toHaveBeenCalledWith(
        {
          storeId: 'store-1',
          type: StockAdjustmentType.RECEIVE,
          remarks: 'Restock',
        },
        options,
      );
      expect(adjustmentItemModel.bulkCreate).toHaveBeenCalledWith(
        itemRecords,
        options,
      );
      expect(stockLedgerService.create).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        id: 'adjustment-1',
        type: dto.type,
        remarks: dto.remarks,
        storeId: dto.storeId,
        createdAt,
        updatedAt: createdAt,
        items: itemRecords,
      });
    });

    it('rejects adjustments without items', async () => {
      await expect(
        service.create({
          storeId: 'store-1',
          type: StockAdjustmentType.RECEIVE,
          items: [],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(adjustmentItemModel.bulkCreate).not.toHaveBeenCalled();
      expect(stockLedgerService.create).not.toHaveBeenCalled();
    });
  });

  describe('updateStockLedger', () => {
    it('records issue adjustments as outbound item ledger entries', async () => {
      const options = { transaction };
      await service.updateStockLedger(
        {
          storeId: 'store-1',
          type: StockAdjustmentType.ISSUE,
          items: [{ itemId: 'item-1', qty: 3 }],
        } as never,
        options,
      );

      expect(stockLedgerService.create).toHaveBeenCalledWith(
        {
          createDto: {
            itemId: 'item-1',
            qty: 3,
            ledgerDirection: LedgerDirection.OUT,
            storeId: 'store-1',
            reference: LedgerReference.ITEM,
          },
        },
        options,
      );
    });

    it('records receive adjustments as inbound item ledger entries', async () => {
      await service.updateStockLedger(
        {
          storeId: 'store-1',
          type: StockAdjustmentType.RECEIVE,
          items: [{ itemId: 'item-1', qty: 3 }],
        } as never,
        { transaction },
      );

      expect(stockLedgerService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          createDto: expect.objectContaining({
            ledgerDirection: LedgerDirection.IN,
          }),
        }),
        { transaction },
      );
    });

    it('does not create ledger entries for an empty item list', async () => {
      await service.updateStockLedger(
        {
          storeId: 'store-1',
          type: StockAdjustmentType.RECEIVE,
          items: [],
        } as never,
        { transaction },
      );

      expect(stockLedgerService.create).not.toHaveBeenCalled();
    });
  });

  describe('findAndCountAll', () => {
    it('filters and sorts adjustments while including related items and item details', async () => {
      const result = { rows: [{ id: 'adjustment-1' }], count: 1 };
      adjustmentModel.findAndCountAll = mock(async () => result);
      const query = { type: StockAdjustmentType.ISSUE };

      const response = await service.findAndCountAll(query);

      expect(response).toBe(result);
      expect(adjustmentModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: query,
          order: [['createdAt', 'DESC']],
        }),
      );
      expect(
        adjustmentModel.findAndCountAll.mock.calls[0][0].include,
      ).toHaveLength(1);
      expect(
        adjustmentModel.findAndCountAll.mock.calls[0][0].include[0].include,
      ).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('deletes the adjustment by id and forwards transaction options', async () => {
      const options = { transaction };

      await service.delete('adjustment-1', options);

      expect(adjustmentModel.destroy).toHaveBeenCalledWith({
        where: { id: 'adjustment-1' },
        ...options,
      });
    });

    it('deletes the adjustment by id without transaction options', async () => {
      await service.delete('adjustment-1');

      expect(adjustmentModel.destroy).toHaveBeenCalledWith({
        where: { id: 'adjustment-1' },
      });
    });
  });
});
