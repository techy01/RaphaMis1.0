import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantStatus } from '../tenants/tenant.entity';
import { Invoice, InvoiceStatus } from '../billing/invoice.entity';
import { Patient } from '../patients/patient.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    private auditService: AuditService,
  ) {}

  async getStats() {
    const totalTenants = await this.tenantsRepository.count();
    const activeTenants = await this.tenantsRepository.count({ where: { status: TenantStatus.Active } });
    const totalPatients = await this.patientsRepository.count();

    // Query sum of paid invoices directly from MySQL
    const revenueResult = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.amount)', 'total')
      .where('invoice.status = :status', { status: InvoiceStatus.Paid })
      .getRawOne();

    const totalRevenue = revenueResult && revenueResult.total ? Number(revenueResult.total) : 0;

    return { totalTenants, activeTenants, totalPatients, totalRevenue };
  }

  async getRecentActivity() {
    return this.auditService.findRecent(10);
  }
}
