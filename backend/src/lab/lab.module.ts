import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LabRequest } from './lab.model';
import { LabService } from './lab.service';
import { LabController } from './lab.controller';

@Module({
  imports: [SequelizeModule.forFeature([LabRequest])],
  providers: [LabService],
  controllers: [LabController],
  exports: [LabService],
})
export class LabModule {}
