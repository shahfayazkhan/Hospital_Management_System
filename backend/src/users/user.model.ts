import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'users' })
export class User extends Model<User> {
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
  username: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  passwordHash: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  fullName: string;

  @Column({
    type: DataType.ENUM(
      'ADMIN',
      'RECEPTIONIST',
      'MEDICAL_OFFICER',
      'DOCTOR',
      'LAB_TECHNICIAN',
      'ULTRASOUND_TECHNICIAN',
    ),
    allowNull: false,
  })
  role: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive: boolean;
}
