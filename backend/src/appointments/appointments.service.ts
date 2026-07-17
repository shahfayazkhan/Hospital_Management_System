import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Appointment } from './appointment.model';
import { Patient } from '../patients/patient.model';
import { User } from '../users/user.model';
import { Vitals } from '../vitals/vitals.model';
import { Consultation } from '../consultations/consultation.model';
import { LabRequest } from '../lab/lab.model';
import { UltrasoundRequest } from '../ultrasound/ultrasound.model';
import { Billing } from '../billing/billing.model';
import { Op } from 'sequelize';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment)
    private appointmentModel: typeof Appointment,
    @InjectModel(Billing)
    private billingModel: typeof Billing,
  ) {}

  async create(createDto: any): Promise<Appointment> {
    const appt = await this.appointmentModel.create({
      patientId: createDto.patientId,
      doctorId: createDto.doctorId,
      appointmentDate: new Date(createDto.appointmentDate),
      notes: createDto.notes,
      status: 'SCHEDULED',
    } as any);

    // Create billing entry for consultation fee (default $50.00)
    await this.billingModel.create({
      appointmentId: appt.id,
      patientId: appt.patientId,
      totalAmount: createDto.consultationFee || 50.00,
      status: 'UNPAID',
    } as any);

    return this.findOne(appt.id);
  }

  async findAll(status?: string, doctorId?: number, date?: string): Promise<Appointment[]> {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (doctorId) {
      where.doctorId = doctorId;
    }
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.appointmentDate = {
        [Op.between]: [startOfDay, endOfDay],
      };
    }

    return this.appointmentModel.findAll({
      where,
      include: [
        { model: Patient },
        { model: User, attributes: ['id', 'fullName', 'role'] },
        { model: Vitals },
        { model: Consultation },
        { model: LabRequest },
        { model: UltrasoundRequest },
        { model: Billing },
      ],
      order: [['appointmentDate', 'ASC']],
    });
  }

  async findOne(id: number): Promise<Appointment> {
    const appt = await this.appointmentModel.findByPk(id, {
      include: [
        { model: Patient },
        { model: User, attributes: ['id', 'fullName', 'role'] },
        { model: Vitals },
        { model: Consultation },
        { model: LabRequest },
        { model: UltrasoundRequest },
        { model: Billing },
      ],
    });
    if (!appt) {
      throw new BadRequestException('Appointment not found');
    }
    return appt;
  }

  async updateStatus(id: number, status: string): Promise<Appointment> {
    const appt = await this.findOne(id);
    appt.status = status;
    await appt.save();
    return appt;
  }
}
