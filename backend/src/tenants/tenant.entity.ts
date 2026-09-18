import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Invoice } from '../billing/invoice.entity';

export enum TenantStatus {
    Active = 'Active',
    Inactive = 'Inactive',
    Suspended = 'Suspended',
    Trial = 'Trial',
}

@Entity('tenants')
export class Tenant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    phone: string;

    @Column()
    address: string;

    @Column({
        type: 'enum',
        enum: TenantStatus,
        default: TenantStatus.Trial,
    })
    status: TenantStatus;

    @Column({ name: 'subscription_plan' })
    subscriptionPlan: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Invoice, invoice => invoice.tenant)
    invoices: Invoice[];
}
