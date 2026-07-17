import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne } from 'sequelize-typescript';
import { Appointment } from '../appointments/appointment.model';
import { Patient } from '../patients/patient.model';
import { User } from '../users/user.model';
import { Prescription } from './prescription.model';

@Table({ tableName: 'consultations' })
export class Consultation extends Model<Consultation> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => Appointment)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  appointmentId: number;

  @BelongsTo(() => Appointment)
  appointment: Appointment;

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
    type: DataType.TEXT,
    allowNull: false,
  })
  chiefComplaints: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  diagnosis: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  clinicalNotes: string;

  @HasOne(() => Prescription)
  prescription: Prescription;
}
