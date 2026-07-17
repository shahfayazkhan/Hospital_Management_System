import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { LabRequest } from './lab.model';
import { Patient } from '../patients/patient.model';
import { Appointment } from '../appointments/appointment.model';

@Injectable()
export class LabService {
  constructor(
    @InjectModel(LabRequest)
    private labRequestModel: typeof LabRequest,
  ) {}

  async findAll(status?: string): Promise<LabRequest[]> {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    return this.labRequestModel.findAll({
      where,
      include: [{ model: Patient }, { model: Appointment }],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: number): Promise<LabRequest> {
    const request = await this.labRequestModel.findByPk(id, {
      include: [{ model: Patient }, { model: Appointment }],
    });
    if (!request) {
      throw new BadRequestException('Lab request not found');
    }
    return request;
  }

  async submitResults(id: number, findings: string, userId: number): Promise<LabRequest> {
    const request = await this.findOne(id);
    if (request.status === 'COMPLETED') {
      throw new BadRequestException('Lab request already completed');
    }

    request.findings = findings;
    request.status = 'COMPLETED';
    request.completedByUserId = userId;
    request.completedAt = new Date();

    await request.save();
    return this.findOne(id);
  }
}
