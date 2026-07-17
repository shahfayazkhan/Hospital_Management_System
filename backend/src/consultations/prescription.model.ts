import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Consultation } from './consultation.model';
import { Patient } from '../patients/patient.model';
import { User } from '../users/user.model';
import { PrescriptionItem } from './prescription-item.model';

@Table({ tableName: 'prescriptions' })
export class Prescription extends Model<Prescription> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => Consultation)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  consultationId: number;

  @BelongsTo(() => Consultation)
  consultation: Consultation;

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
    allowNull: true,
  })
  notes: string;

  @HasMany(() => PrescriptionItem)
  items: PrescriptionItem[];
}
