import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRoleEnum } from '../users/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.Superadmin, UserRoleEnum.TenantAdmin)
@Controller()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('billing/invoices')
  findAllBillingInvoices() {
    return this.billingService.findAllInvoices();
  }

  @Get('invoices')
  findAllInvoices() {
    return this.billingService.findAllInvoices();
  }

  @Get('billing/invoices/tenant/:tenantId')
  findInvoicesForTenant(@Param('tenantId') tenantId: string) {
    return this.billingService.findInvoicesForTenant(tenantId);
  }

  @Post('billing/invoices/generate')
  generateInvoices() {
    // Scheduled or manual invoice generation
    return this.billingService.generateMonthlyInvoices();
  }
}
