import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Appointment } from '../appointments/appointment.model';
import { Patient } from '../patients/patient.model';
import { User } from '../users/user.model';

@Table({ tableName: 'ultrasound_requests' })
export class UltrasoundRequest extends Model<UltrasoundRequest> {
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
  requestedByUserId: number;

  @BelongsTo(() => User, 'requestedByUserId')
  requestedBy: User;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  scanType: string;

  @Column({
    type: DataType.ENUM('PENDING', 'COMPLETED'),
    defaultValue: 'PENDING',
  })
  status: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  findings: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  imagePath: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  completedByUserId: number;

  @BelongsTo(() => User, 'completedByUserId')
  completedBy: User;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  completedAt: Date;
}
