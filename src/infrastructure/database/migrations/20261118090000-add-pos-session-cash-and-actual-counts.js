'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('pos_session_entries', 'opening_cash', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('pos_session_entries', 'actual_cash', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('pos_session_entries', 'remarks', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('pos_session_entry_items', 'actual_qty', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.changeColumn('pos_session_entry_items', 'closing_qty', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('pos_session_entry_items', 'closing_qty', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    const columns = await queryInterface.describeTable('pos_session_entries');
    if (columns.remarks) await queryInterface.removeColumn('pos_session_entries', 'remarks');
    if (columns.actual_cash) await queryInterface.removeColumn('pos_session_entries', 'actual_cash');
    if (columns.opening_cash) await queryInterface.removeColumn('pos_session_entries', 'opening_cash');

    const itemColumns = await queryInterface.describeTable('pos_session_entry_items');
    if (itemColumns.actual_qty) await queryInterface.removeColumn('pos_session_entry_items', 'actual_qty');
  },
};
