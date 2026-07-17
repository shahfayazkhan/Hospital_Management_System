import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Appointment } from '../appointments/appointment.model';
import { Patient } from '../patients/patient.model';

@Table({ tableName: 'billing' })
export class Billing extends Model<Billing> {
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

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  totalAmount: number;

  @Column({
    type: DataType.ENUM('UNPAID', 'PAID'),
    defaultValue: 'UNPAID',
  })
  status: string;

  @Column({
    type: DataType.ENUM('CASH', 'CARD', 'INSURANCE'),
    allowNull: true,
  })
  paymentMethod: string;
}
