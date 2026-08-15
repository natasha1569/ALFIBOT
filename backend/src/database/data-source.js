import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { entities } from './entities/schemas.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD || ''),
  schema: 'alfi',
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  entities,
});

let initializationPromise;

export const initializeDataSource = async () => {
  if (AppDataSource.isInitialized) return AppDataSource;
  initializationPromise ??= AppDataSource.initialize().catch((error) => {
    initializationPromise = undefined;
    throw error;
  });
  return initializationPromise;
};

export const getDataSource = async () => initializeDataSource();
