import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UltrasoundRequest } from './ultrasound.model';
import { Patient } from '../patients/patient.model';
import { Appointment } from '../appointments/appointment.model';

@Injectable()
export class UltrasoundService {
  constructor(
    @InjectModel(UltrasoundRequest)
    private ultrasoundRequestModel: typeof UltrasoundRequest,
  ) {}

  async findAll(status?: string): Promise<UltrasoundRequest[]> {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    return this.ultrasoundRequestModel.findAll({
      where,
      include: [{ model: Patient }, { model: Appointment }],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: number): Promise<UltrasoundRequest> {
    const request = await this.ultrasoundRequestModel.findByPk(id, {
      include: [{ model: Patient }, { model: Appointment }],
    });
    if (!request) {
      throw new BadRequestException('Ultrasound request not found');
    }
    return request;
  }

  async submitResults(id: number, submitDto: any, userId: number): Promise<UltrasoundRequest> {
    const request = await this.findOne(id);
    if (request.status === 'COMPLETED') {
      throw new BadRequestException('Ultrasound request already completed');
    }

    request.findings = submitDto.findings;
    request.imagePath = submitDto.imagePath || '';
    request.status = 'COMPLETED';
    request.completedByUserId = userId;
    request.completedAt = new Date();

    await request.save();
    return this.findOne(id);
  }
}
