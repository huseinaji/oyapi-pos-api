'use strict';

const { ulid } = require('ulid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const packages = [
      {
        id: ulid(),
        code: 'free',
        name: 'Free',
        description: 'Starter package for a single store',
        is_active: true,
        sort_order: 0,
        created_at: now,
        updated_at: now,
        rules: [
          { rule_key: 'maxStores', value_type: 'number', value: '1' },
          { rule_key: 'maxMembersPerStore', value_type: 'number', value: '2' },
          { rule_key: 'posEnabled', value_type: 'boolean', value: 'true' },
        ],
      },
      {
        id: ulid(),
        code: 'pro',
        name: 'Pro',
        description: 'Growth package for multiple stores',
        is_active: true,
        sort_order: 1,
        created_at: now,
        updated_at: now,
        rules: [
          { rule_key: 'maxStores', value_type: 'number', value: '5' },
          { rule_key: 'maxMembersPerStore', value_type: 'number', value: '10' },
          { rule_key: 'posEnabled', value_type: 'boolean', value: 'true' },
        ],
      },
      {
        id: ulid(),
        code: 'pro_plus',
        name: 'Pro+',
        description: 'Unlimited package for larger operations',
        is_active: true,
        sort_order: 2,
        created_at: now,
        updated_at: now,
        rules: [
          { rule_key: 'maxStores', value_type: 'number', value: '-1' },
          { rule_key: 'maxMembersPerStore', value_type: 'number', value: '-1' },
          { rule_key: 'posEnabled', value_type: 'boolean', value: 'true' },
        ],
      },
    ];

    await queryInterface.bulkInsert(
      'subscription_packages',
      packages.map(({ rules, ...pkg }) => pkg),
    );

    const ruleRows = packages.flatMap((pkg) =>
      pkg.rules.map((rule) => ({
        id: ulid(),
        package_id: pkg.id,
        rule_key: rule.rule_key,
        value_type: rule.value_type,
        value: rule.value,
        created_at: now,
        updated_at: now,
      })),
    );

    await queryInterface.bulkInsert('subscription_package_rules', ruleRows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('subscription_package_rules', null, {});
    await queryInterface.bulkDelete('subscription_packages', {
      code: ['free', 'pro', 'pro_plus'],
    });
  },
};
