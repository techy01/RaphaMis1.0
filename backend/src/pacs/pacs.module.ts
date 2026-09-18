import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacsStudyEntity } from './pacs-study.entity';
import { PacsServerEntity } from './pacs-server.entity';
import { PacsService } from './pacs.service';
import { PacsController } from './pacs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PacsStudyEntity, PacsServerEntity])],
  controllers: [PacsController],
  providers: [PacsService],
  exports: [PacsService],
})
export class PacsModule {}
