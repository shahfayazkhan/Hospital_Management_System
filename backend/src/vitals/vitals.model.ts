import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Patient } from '../patients/patient.model';
import { Appointment } from '../appointments/appointment.model';
import { User } from '../users/user.model';

@Table({ tableName: 'vitals' })
export class Vitals extends Model<Vitals> {
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

  @Column({ type: DataType.INTEGER, allowNull: true })
  systolicBP: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  diastolicBP: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  pulse: number;

  @Column({ type: DataType.FLOAT, allowNull: true })
  temperature: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  respiratoryRate: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  spo2: number;

  @Column({ type: DataType.FLOAT, allowNull: true })
  weight: number;

  @Column({ type: DataType.FLOAT, allowNull: true })
  height: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  recordedByUserId: number;

  @BelongsTo(() => User)
  recordedBy: User;
}
