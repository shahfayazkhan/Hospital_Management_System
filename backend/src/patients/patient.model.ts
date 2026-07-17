import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Appointment } from '../appointments/appointment.model';

@Table({ tableName: 'patients' })
export class Patient extends Model<Patient> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  mrn: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  fullName: string;

  @Column({
    type: DataType.ENUM('MALE', 'FEMALE', 'OTHER'),
    allowNull: false,
  })
  gender: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  dateOfBirth: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phone: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  address: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  emergencyContact: string;

  @HasMany(() => Appointment)
  appointments: Appointment[];
}
