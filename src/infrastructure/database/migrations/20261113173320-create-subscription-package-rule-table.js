'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscription_package_rules', {
      id: {
        type: Sequelize.STRING(26),
        primaryKey: true,
        allowNull: false,
      },
      package_id: {
        type: Sequelize.CHAR(26),
        allowNull: false,
        references: {
          model: 'subscription_packages',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      rule_key: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      value_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: false,
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

    await queryInterface.addIndex('subscription_package_rules', {
      fields: ['package_id', 'rule_key'],
      unique: true,
      name: 'subscription_package_rules_package_id_rule_key_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('subscription_package_rules');
  },
};
