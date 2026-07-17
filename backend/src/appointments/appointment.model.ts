import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne, HasMany } from 'sequelize-typescript';
import { Patient } from '../patients/patient.model';
import { User } from '../users/user.model';
import { Vitals } from '../vitals/vitals.model';
import { Consultation } from '../consultations/consultation.model';
import { LabRequest } from '../lab/lab.model';
import { UltrasoundRequest } from '../ultrasound/ultrasound.model';
import { Billing } from '../billing/billing.model';

@Table({ tableName: 'appointments' })
export class Appointment extends Model<Appointment> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => Patient)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  patientId: number;

  @BelongsTo(() => Patient)
  patient: Patient;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  doctorId: number;

  @BelongsTo(() => User)
  doctor: User;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  appointmentDate: Date;

  @Column({
    type: DataType.ENUM('SCHEDULED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'SCHEDULED',
  })
  status: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @HasOne(() => Vitals)
  vitals: Vitals;

  @HasOne(() => Consultation)
  consultation: Consultation;

  @HasMany(() => LabRequest)
  labRequests: LabRequest[];

  @HasMany(() => UltrasoundRequest)
  ultrasoundRequests: UltrasoundRequest[];

  @HasOne(() => Billing)
  billing: Billing;
}
