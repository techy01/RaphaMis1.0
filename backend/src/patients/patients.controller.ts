import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Patient } from './patient.entity';

@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  findAll(@Query('tenantId') tenantId?: string) {
    return this.patientsService.findAll(tenantId);
  }

  @Get('stats')
  getStats(@Query('tenantId') tenantId?: string) {
    return this.patientsService.getStats(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<Patient>) {
    return this.patientsService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Patient>) {
    return this.patientsService.update(id, data);
  }

  @Post(':id/vitals')
  updateVitals(@Param('id') id: string, @Body() vitals: any) {
    return this.patientsService.updateVitals(id, vitals);
  }

  @Post(':id/notes')
  addNote(@Param('id') id: string, @Body() note: any) {
    return this.patientsService.addNote(id, note);
  }

  @Post(':id/prescriptions')
  addPrescription(@Param('id') id: string, @Body() prescription: any) {
    return this.patientsService.addPrescription(id, prescription);
  }

  @Post(':id/evaluate-prescription')
  evaluatePrescription(@Param('id') id: string, @Body() body: { medication: string }) {
    return this.patientsService.evaluatePrescription(id, body.medication);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
