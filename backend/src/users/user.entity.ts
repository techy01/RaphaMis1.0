import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRoleEnum {
    Superadmin = 'Superadmin',
    TenantAdmin = 'Tenant-Admin',
    Doctor = 'Doctor',
    Nurse = 'Nurse',
    Billing = 'Billing',
    Pharmacist = 'Pharmacist',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false }) // Exclude password by default from queries
    password: string;

    @Column({
        type: 'enum',
        enum: UserRoleEnum,
        default: UserRoleEnum.TenantAdmin,
    })
    role: UserRoleEnum;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
