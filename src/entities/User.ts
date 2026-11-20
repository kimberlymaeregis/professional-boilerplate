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
@Index(['verificationToken'], { unique: true })
@Index(['resetPasswordToken'], { unique: true })
export class User {
   @PrimaryGeneratedColumn()
   id!: number;


   @Column({ length: 100 })
   name!: string;


   @Column({ length: 100, unique: true })
   email!: string;


   @Column({ length: 255, select: false })
   password!: string;


   @Column({ default: true })
   isActive!: boolean;


   // === EMAIL VERIFICATION FIELDS ===
  
   @Column({ default: false })
   isVerified!: boolean;


   @Column({ type: 'varchar', length: 255, nullable: true, select: false })
   verificationToken!: string | null;


   @Column({ type: 'datetime', nullable: true })
   verificationTokenExpiry!: Date | null;


   // === PASSWORD RESET FIELDS ===
  
   @Column({ type: 'varchar', length: 255, nullable: true, select: false })
   resetPasswordToken!: string | null;


   @Column({ type: 'datetime', nullable: true })
   resetPasswordExpiry!: Date | null;


   // === EXISTING FIELDS ===


   @Column({ type: 'int', nullable: true })
   age!: number;


   @CreateDateColumn()
   createdAt!: Date;


   @UpdateDateColumn()
   updatedAt!: Date;
}
