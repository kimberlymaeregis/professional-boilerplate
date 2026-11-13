
import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn,
    Index
} from 'typeorm';

@Entity('users')
@Index(['email'], { unique: true })
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100 })
    name!: string;

    @Column({ length: 100})
    email!: string;

    @Column({ length: 255, select: false })
    password!: string;

    @Column({ default: true })
    isActive!: boolean;

    @Column({ type: 'int', nullable: true })
    age!: number;

    @CreateDateColumn()
    createdAt!: Date;
    
    @UpdateDateColumn()
    updatedAt!: Date;
}
