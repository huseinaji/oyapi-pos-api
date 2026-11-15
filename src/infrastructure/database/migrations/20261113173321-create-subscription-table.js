'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscriptions', {
      id: {
        type: Sequelize.STRING(26),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.CHAR(26),
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      package_id: {
        type: Sequelize.CHAR(26),
        allowNull: false,
        references: {
          model: 'subscription_packages',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      ends_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      canceled_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex('subscriptions', {
      fields: ['user_id'],
      name: 'idx_subscriptions_user_id',
    });

    await queryInterface.addIndex('subscriptions', {
      fields: ['user_id'],
      unique: true,
      name: 'subscriptions_user_id_active_unique',
      where: {
        status: 'active',
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('subscriptions');
  },
};
