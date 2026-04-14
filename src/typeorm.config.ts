import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config();

const obj =
  process.env.DB_SSL_MODE === 'require'
    ? { ssl: { rejectUnauthorized: false }, extra: { ssl: { rejectUnauthorized: false } } }
    : {};

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(String(process.env.DB_PORT)),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['src/data/entities/*.entity.ts'],
  migrations: ['src/data/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: false,
  ...obj,
};

export default new DataSource(dataSourceOptions);
