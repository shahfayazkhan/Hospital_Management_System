import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Patient } from './patient.model';
import { Op } from 'sequelize';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient)
    private patientModel: typeof Patient,
  ) {}

  async create(createPatientDto: any): Promise<Patient> {
    const count = await this.patientModel.count();
    const mrn = `PAT-${10000 + count + 1}`;

    const patient = new this.patientModel({
      mrn,
      fullName: createPatientDto.fullName,
      gender: createPatientDto.gender,
      dateOfBirth: createPatientDto.dateOfBirth,
      phone: createPatientDto.phone,
      address: createPatientDto.address,
      emergencyContact: createPatientDto.emergencyContact,
    } as any);

    return patient.save();
  }

  async findAll(search?: string): Promise<Patient[]> {
    const where: any = {};
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { mrn: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }
    return this.patientModel.findAll({ where, order: [['createdAt', 'DESC']] });
  }

  async findOne(id: number): Promise<Patient> {
    const patient = await this.patientModel.findByPk(id);
    if (!patient) {
      throw new BadRequestException('Patient not found');
    }
    return patient;
  }

  async update(id: number, updatePatientDto: any): Promise<Patient> {
    const patient = await this.findOne(id);
    await patient.update(updatePatientDto);
    return patient;
  }
}
