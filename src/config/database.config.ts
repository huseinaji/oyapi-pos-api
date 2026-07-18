import * as dotenv from 'dotenv';
import path from 'path';
import { DataSourceOptions } from 'typeorm';

dotenv.config();

export function getDbConfig(): DataSourceOptions {
  return {
    type: 'mariadb',
    host: process.env.DB_HOST,
    port: 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    entities: [path.join(__dirname, '..', 'modules', '**', '*.entity.{ts,js}')],
    migrations: [path.join(__dirname, '..', 'database', 'migration', '*.{ts,js}')],

    // optional
    migrationsRun: false,
    migrationsTableName: 'migrations',
    migrationsTransactionMode: 'all',
  };
}