import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Consultation } from './consultation.model';
import { Prescription } from './prescription.model';
import { PrescriptionItem } from './prescription-item.model';
import { Appointment } from '../appointments/appointment.model';
import { LabRequest } from '../lab/lab.model';
import { UltrasoundRequest } from '../ultrasound/ultrasound.model';
import { ConsultationsService } from './consultations.service';
import { ConsultationsController } from './consultations.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Consultation,
      Prescription,
      PrescriptionItem,
      Appointment,
      LabRequest,
      UltrasoundRequest,
    ]),
  ],
  providers: [ConsultationsService],
  controllers: [ConsultationsController],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}
