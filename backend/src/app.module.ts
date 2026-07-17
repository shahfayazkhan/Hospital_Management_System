import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Models
import { User } from './users/user.model';
import { Patient } from './patients/patient.model';
import { Appointment } from './appointments/appointment.model';
import { Vitals } from './vitals/vitals.model';
import { Consultation } from './consultations/consultation.model';
import { Prescription } from './consultations/prescription.model';
import { PrescriptionItem } from './consultations/prescription-item.model';
import { LabRequest } from './lab/lab.model';
import { UltrasoundRequest } from './ultrasound/ultrasound.model';
import { Billing } from './billing/billing.model';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { VitalsModule } from './vitals/vitals.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { LabModule } from './lab/lab.module';
import { UltrasoundModule } from './ultrasound/ultrasound.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_management_system',
      models: [
        User,
        Patient,
        Appointment,
        Vitals,
        Consultation,
        Prescription,
        PrescriptionItem,
        LabRequest,
        UltrasoundRequest,
        Billing,
      ],
      autoLoadModels: true,
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    PatientsModule,
    AppointmentsModule,
    VitalsModule,
    ConsultationsModule,
    LabModule,
    UltrasoundModule,
    BillingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
