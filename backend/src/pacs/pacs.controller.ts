import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PacsService } from './pacs.service';
import { PacsServerEntity } from './pacs-server.entity';

@Controller('pacs')
export class PacsController {
  constructor(private readonly pacsService: PacsService) {}

  @Get('studies')
  async getStudies(
    @Query('tenantId') tenantId?: string,
    @Query('search') search?: string,
    @Query('modality') modality?: string,
    @Query('patientMRN') patientMRN?: string,
    @Query('accessionNumber') accessionNumber?: string,
  ) {
    return this.pacsService.getStudies({
      tenantId,
      search,
      modality,
      patientMRN,
      accessionNumber,
    });
  }

  @Get('studies/:studyInstanceUid')
  async getStudyByUid(@Param('studyInstanceUid') studyInstanceUid: string) {
    return this.pacsService.getStudyByUid(studyInstanceUid);
  }

  @Get('servers')
  async getServers(@Query('tenantId') tenantId?: string) {
    return this.pacsService.getServers(tenantId);
  }

  @Post('servers')
  async upsertServer(@Body() dto: Partial<PacsServerEntity>) {
    return this.pacsService.upsertServer(dto);
  }

  @Post('servers/:id/echo')
  async echoServer(@Param('id') serverId: string) {
    return this.pacsService.echoServer(serverId);
  }

  @Post('upload')
  async uploadDicomInstance(@Body() payload: any) {
    return this.pacsService.ingestDicomInstance(payload);
  }

  @Post('studies/:studyInstanceUid/export')
  async exportStudy(
    @Param('studyInstanceUid') studyInstanceUid: string,
    @Body() options: { anonymize?: boolean },
  ) {
    const study = await this.pacsService.getStudyByUid(studyInstanceUid);
    return {
      success: true,
      studyInstanceUid,
      anonymized: Boolean(options?.anonymize),
      downloadUrl: `/api/pacs/downloads/${studyInstanceUid}.zip`,
      expiresIn: '24 hours',
      study,
    };
  }
}
