import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';
import { createLogger } from '../utils/logger';

const logger = createLogger('Seeder');

export const seedUsers = async () => {
    const userRepository = AppDataSource.getRepository(User);
    
    const users = [
        {
            name: 'Admin User',
            email: 'admin@example.com',
            password: await bcrypt.hash('Admin123!', 10),
            isActive: true,
        },
        {
            name: 'Test User',
            email: 'test@example.com',
            password: await bcrypt.hash('Test123!', 10),
            isActive: true,
        },
    ];

    for (const userData of users) {
        const existing = await userRepository.findOne({ 
            where: { email: userData.email } 
        });
        
        if (!existing) {
            await userRepository.save(userData);
            logger.info(`Seeded user: ${userData.email}`);
        } else {
            logger.info(`User already exists: ${userData.email}`);
        }
    }
};

