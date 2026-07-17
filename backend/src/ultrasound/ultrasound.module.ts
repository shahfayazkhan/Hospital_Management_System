import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UltrasoundRequest } from './ultrasound.model';
import { UltrasoundService } from './ultrasound.service';
import { UltrasoundController } from './ultrasound.controller';

@Module({
  imports: [SequelizeModule.forFeature([UltrasoundRequest])],
  providers: [UltrasoundService],
  controllers: [UltrasoundController],
  exports: [UltrasoundService],
})
export class UltrasoundModule {}
