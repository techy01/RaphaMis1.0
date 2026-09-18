import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from './invoice.entity';
import { Tenant, TenantStatus } from '../tenants/tenant.entity';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
  ) {}

  async findAllInvoices(): Promise<Invoice[]> {
    return this.invoicesRepository.find({ 
      relations: ['tenant'],
      order: { createdAt: 'DESC' } 
    });
  }
  
  async findInvoicesForTenant(tenantId: string): Promise<Invoice[]> {
    return this.invoicesRepository.find({ 
      where: { tenantId }, 
      relations: ['tenant'],
      order: { createdAt: 'DESC' } 
    });
  }

  // This would be a cron job in a real app
  async generateMonthlyInvoices(): Promise<Invoice[]> {
    const tenants = await this.tenantsRepository.find({ where: { status: TenantStatus.Active } });
    const newInvoices: Invoice[] = [];
    
    for (const tenant of tenants) {
      const amount = tenant.subscriptionPlan === 'Pro' ? 2500 : (tenant.subscriptionPlan === 'Basic' ? 1000 : 5000);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const invoice = this.invoicesRepository.create({
        tenant: tenant,
        tenantId: tenant.id,
        amount: amount,
        dueDate: dueDate.toISOString().split('T')[0],
        status: InvoiceStatus.Pending,
      });
      newInvoices.push(await this.invoicesRepository.save(invoice));
    }
    return newInvoices;
  }
}
