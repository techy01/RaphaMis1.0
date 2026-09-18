import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';

export enum InvoiceStatus {
    Paid = 'Paid',
    Pending = 'Pending',
    Overdue = 'Overdue',
    Cancelled = 'Cancelled',
}

@Entity('invoices')
export class Invoice {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ name: 'due_date', type: 'date' })
    dueDate: string;

    @Column({ name: 'paid_date', type: 'date', nullable: true })
    paidDate: string | null;

    @Column({
        type: 'enum',
        enum: InvoiceStatus,
        default: InvoiceStatus.Pending,
    })
    status: InvoiceStatus;
    
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Tenant, tenant => tenant.invoices, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column({ name: 'tenant_id' })
    tenantId: string;
}
