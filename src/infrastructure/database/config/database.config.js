module.exports = {
  local: {
    use_env_variable: 'DATABASE_URL_UNPOOLED',
    dialect: 'postgres',
    dialectOptions: {
      ssl: true,
    },
    logging: false,
    define: {
      underscored: true,
    },
  },
  production: {
    use_env_variable: 'DATABASE_URL_UNPOOLED',
    dialect: 'postgres',
    dialectOptions: {
      ssl: true,
    },
    logging: false,
    define: {
      underscored: true,
    },
  },
};
