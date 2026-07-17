import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Prescription } from './prescription.model';

@Table({ tableName: 'prescription_items' })
export class PrescriptionItem extends Model<PrescriptionItem> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => Prescription)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  prescriptionId: number;

  @BelongsTo(() => Prescription)
  prescription: Prescription;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  medicineName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  dosage: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  frequency: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  duration: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  instructions: string;
}
