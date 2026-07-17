import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Vitals } from './vitals.model';
import { Appointment } from '../appointments/appointment.model';
import { VitalsService } from './vitals.service';
import { VitalsController } from './vitals.controller';

@Module({
  imports: [SequelizeModule.forFeature([Vitals, Appointment])],
  providers: [VitalsService],
  controllers: [VitalsController],
  exports: [VitalsService],
})
export class VitalsModule {}
