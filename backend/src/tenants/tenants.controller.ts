import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRoleEnum } from '../users/user.entity';
import { IsOptional, IsString, IsIn, IsEmail, IsPhoneNumber } from 'class-validator';
import { TenantStatus } from './tenant.entity';

// DTO for updates, allowing partial updates
export class UpdateTenantDto {
    @IsOptional() @IsString() name?: string;
    @IsOptional() @IsEmail() email?: string;
    @IsOptional() @IsPhoneNumber('KE') phone?: string;
    @IsOptional() @IsString() address?: string;
    @IsOptional() @IsString() @IsIn(['Basic', 'Pro', 'Enterprise']) subscriptionPlan?: string;
    @IsOptional() @IsIn([TenantStatus.Active, TenantStatus.Inactive, TenantStatus.Suspended]) status?: TenantStatus;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.Superadmin)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}
