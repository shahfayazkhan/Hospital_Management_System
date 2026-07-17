import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Vitals } from './vitals.model';
import { Appointment } from '../appointments/appointment.model';

@Injectable()
export class VitalsService {
  constructor(
    @InjectModel(Vitals)
    private vitalsModel: typeof Vitals,
    @InjectModel(Appointment)
    private appointmentModel: typeof Appointment,
  ) {}

  async record(recordDto: any, userId: number): Promise<Vitals> {
    const appt = await this.appointmentModel.findByPk(recordDto.appointmentId);
    if (!appt) {
      throw new BadRequestException('Appointment not found');
    }

    // Check if vitals already recorded for this appointment
    let vitals = await this.vitalsModel.findOne({
      where: { appointmentId: recordDto.appointmentId },
    });

    if (vitals) {
      // Update existing vitals
      await vitals.update({
        systolicBP: recordDto.systolicBP,
        diastolicBP: recordDto.diastolicBP,
        pulse: recordDto.pulse,
        temperature: recordDto.temperature,
        respiratoryRate: recordDto.respiratoryRate,
        spo2: recordDto.spo2,
        weight: recordDto.weight,
        height: recordDto.height,
        recordedByUserId: userId,
      });
    } else {
      // Create new vitals
      vitals = await this.vitalsModel.create({
        appointmentId: recordDto.appointmentId,
        patientId: appt.patientId,
        systolicBP: recordDto.systolicBP,
        diastolicBP: recordDto.diastolicBP,
        pulse: recordDto.pulse,
        temperature: recordDto.temperature,
        respiratoryRate: recordDto.respiratoryRate,
        spo2: recordDto.spo2,
        weight: recordDto.weight,
        height: recordDto.height,
        recordedByUserId: userId,
      } as any);
    }

    // Transition appointment status to IN_PROGRESS so it reaches the doctor's queue
    appt.status = 'IN_PROGRESS';
    await appt.save();

    return vitals;
  }

  async findByAppointmentId(appointmentId: number): Promise<Vitals | null> {
    return this.vitalsModel.findOne({
      where: { appointmentId },
      include: [{ model: Appointment }],
    });
  }
}
