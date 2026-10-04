'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pos_session_entries', {
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
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'active',
      },
      created_by: {
        type: Sequelize.STRING(26),
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      closed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      closed_by: {
        type: Sequelize.STRING(26),
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    const indexes = [
      {
        fields: ['status'],
        name: 'idx_pos_session_entries_status',
      },
      {
        fields: ['store_id'],
        name: 'store_session_active_store_unique',
        unique: true,
        where: {
          status: 'active'
        }
      }
    ];

    for (const index of indexes) {
      await queryInterface.addIndex('pos_session_entries', index);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pos_session_entries');
  },
};
