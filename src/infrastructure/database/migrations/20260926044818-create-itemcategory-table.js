'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('item_categories', {
      id: {
        type: Sequelize.STRING(26),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      store_id: {
        type: Sequelize.CHAR(26),
        allowNull: false,
        references: {
          model: 'stores',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    await queryInterface.addIndex(
      'item_categories',
      ['store_id', 'name'],
      {
        type: 'UNIQUE',
        name: 'uniq_store_name'
      }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('item_categories');
  }
};
