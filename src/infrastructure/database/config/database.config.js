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
  staging: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'postgres',
    logging: false,
    define: {
      underscored: true,
    },
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'postgres',
    logging: false,
    define: {
      underscored: true,
    },
  },
};
