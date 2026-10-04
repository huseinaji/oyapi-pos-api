'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bins', {
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
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'items',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        unique: true,
      },
      qty: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      reserved_qty: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      actual_qty: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      uom: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pcs',
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
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('bins');
  }
};
