'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pos_session_entry_items', {
      id: {
        type: Sequelize.STRING(26),
        primaryKey: true,
        allowNull: false,
      },
      pos_session_id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        references: {
          model: 'pos_session_entries',
          key: 'id',
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
        onDelete: 'CASCADE'
      },
      opening_qty: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      closing_qty: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      sold_qty: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pos_session_entry_items');
  }
};
