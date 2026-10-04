'use strict';

const { SequelizeHealthIndicator } = require('@nestjs/terminus');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stock_ledger_entries', {
      id: {
        type: Sequelize.STRING(26),
        primaryKey: true,
        allowNull: false,
      },
      store_id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        references: {
          model: 'stores',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      item_id: {
        type: Sequelize.STRING(26),
        references: {
          model: 'items',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      qty: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      ledger_direction: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      balance_after: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'active',
      },
      reference: {
        type: Sequelize.STRING,
        defaultValue: 'sales_invoice'
      },
      reference_id: {
        type: Sequelize.STRING,
      },
      remarks: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('stock_ledger_entries');
  }
};
