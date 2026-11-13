import { DataSource } from 'typeorm';
import { config } from './env';
import { User } from '../entities/User';
import path from 'path';

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: config.db.host,
    port: config.db.port,
    username: config.db.username,
    password: config.db.password,
    database: config.db.database,
    entities: [User],
    synchronize: false,
    migrations: [path.join(__dirname, '../migrations/*.{ts,js}')],
    logging: config.isDev ? ['error', 'warn'] : ['error'],
    extra: {
        connectionLimit: 10,
    },
});
