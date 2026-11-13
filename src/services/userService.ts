import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { NotFoundError, ConflictError } from '../utils/errors';
import bcrypt from 'bcrypt';
import { createLogger } from '../utils/logger';

const logger = createLogger('UserService');
const userRepository = AppDataSource.getRepository(User);

interface FindAllOptions {
    page: number;
    limit: number;
    sort: string;
    order: 'ASC' | 'DESC';
}

export class UserService {
   static async findAll(options: FindAllOptions): Promise<[User[], number]> {
        const { page, limit, sort, order } = options;
        const skip = (page - 1) * limit;
        
        return userRepository.findAndCount({
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                age: true,
                createdAt: true,
                updatedAt: true,
            },
            order: { [sort as keyof User]: order },
            skip,
            take: limit,
        });
    }

    static async findById(id: number): Promise<User> {
        const user = await userRepository.findOne({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                age: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        
        if (!user) {
            throw new NotFoundError('User', id);
        }
        
        return user;
    }
    static async create(data: { 
        name: string; 
        email: string; 
        password: string; 
        age?: number 
    }): Promise<User> {
        const existing = await userRepository.findOne({ 
            where: { email: data.email } 
        });
        
        if (existing) {
            throw new ConflictError('A user with this email already exists');
        }
        
        const hashedPassword = await bcrypt.hash(data.password, 10);
        
        const user = userRepository.create({
            ...data,
            password: hashedPassword,
        });
        
        const savedUser = await userRepository.save(user);
        delete (savedUser as any).password;
        
        return savedUser;
    }

    static async update(id: number, data: Partial<User>): Promise<User> {
        const user = await userRepository.findOne({ where: { id } });
        
        if (!user) {
            throw new NotFoundError('User', id);
        }
        
        if (data.email && data.email !== user.email) {
            const existing = await userRepository.findOne({ 
                where: { email: data.email } 
            });
            
            if (existing) {
                throw new ConflictError('A user with this email already exists');
            }
        }
        
        Object.assign(user, data);
        
        return userRepository.save(user);
    }

    static async delete(id: number): Promise<void> {
        const user = await userRepository.findOne({ where: { id } });
        
        if (!user) {
            throw new NotFoundError('User', id);
        }
        
        await userRepository.remove(user);
    }
}
