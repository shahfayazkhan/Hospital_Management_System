import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Billing } from './billing.model';
import { Patient } from '../patients/patient.model';
import { Appointment } from '../appointments/appointment.model';

@Injectable()
export class BillingService {
  constructor(
    @InjectModel(Billing)
    private billingModel: typeof Billing,
  ) {}

  async findAll(status?: string): Promise<Billing[]> {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    return this.billingModel.findAll({
      where,
      include: [{ model: Patient }, { model: Appointment }],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: number): Promise<Billing> {
    const bill = await this.billingModel.findByPk(id, {
      include: [{ model: Patient }, { model: Appointment }],
    });
    if (!bill) {
      throw new BadRequestException('Billing record not found');
    }
    return bill;
  }

  async pay(id: number, paymentMethod: string): Promise<Billing> {
    const bill = await this.findOne(id);
    if (bill.status === 'PAID') {
      throw new BadRequestException('Invoice is already paid');
    }
    bill.status = 'PAID';
    bill.paymentMethod = paymentMethod;
    await bill.save();
    return this.findOne(id);
  }
}
