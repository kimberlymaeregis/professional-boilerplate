import { AppDataSource } from '../config/data-source';
import { seedUsers } from './userSeeder';
import { logger } from '../utils/logger';

const runSeeds = async () => {
    try {
        await AppDataSource.initialize();
        logger.info('Database connected for seeding');
        
        await seedUsers();
        
        logger.info('✅ All seeds completed');
        process.exit(0);
    } catch (error) {
        logger.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

runSeeds();

