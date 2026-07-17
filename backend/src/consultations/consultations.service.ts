import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Consultation } from './consultation.model';
import { Prescription } from './prescription.model';
import { PrescriptionItem } from './prescription-item.model';
import { Appointment } from '../appointments/appointment.model';
import { LabRequest } from '../lab/lab.model';
import { UltrasoundRequest } from '../ultrasound/ultrasound.model';
import { Patient } from '../patients/patient.model';
import { Vitals } from '../vitals/vitals.model';

@Injectable()
export class ConsultationsService {
  constructor(
    @InjectModel(Consultation)
    private consultationModel: typeof Consultation,
    @InjectModel(Prescription)
    private prescriptionModel: typeof Prescription,
    @InjectModel(PrescriptionItem)
    private prescriptionItemModel: typeof PrescriptionItem,
    @InjectModel(Appointment)
    private appointmentModel: typeof Appointment,
    @InjectModel(LabRequest)
    private labRequestModel: typeof LabRequest,
    @InjectModel(UltrasoundRequest)
    private ultrasoundRequestModel: typeof UltrasoundRequest,
  ) {}

  async create(submitDto: any, doctorId: number): Promise<Consultation> {
    const appt = await this.appointmentModel.findByPk(submitDto.appointmentId);
    if (!appt) {
      throw new BadRequestException('Appointment not found');
    }

    // 1. Create Consultation
    const consultation = await this.consultationModel.create({
      appointmentId: appt.id,
      patientId: appt.patientId,
      doctorId: doctorId,
      chiefComplaints: submitDto.chiefComplaints,
      diagnosis: submitDto.diagnosis,
      clinicalNotes: submitDto.clinicalNotes,
    } as any);

    // 2. Create Prescription if provided
    if (submitDto.prescription && submitDto.prescription.items && submitDto.prescription.items.length > 0) {
      const prescription = await this.prescriptionModel.create({
        consultationId: consultation.id,
        patientId: appt.patientId,
        doctorId: doctorId,
        notes: submitDto.prescription.notes,
      } as any);

      for (const item of submitDto.prescription.items) {
        await this.prescriptionItemModel.create({
          prescriptionId: prescription.id,
          medicineName: item.medicineName,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions,
        } as any);
      }
    }

    // 3. Create Lab Orders if provided
    if (submitDto.labOrders && submitDto.labOrders.length > 0) {
      for (const testName of submitDto.labOrders) {
        await this.labRequestModel.create({
          appointmentId: appt.id,
          patientId: appt.patientId,
          requestedByUserId: doctorId,
          testName: testName,
          status: 'PENDING',
        } as any);
      }
    }

    // 4. Create Ultrasound Orders if provided
    if (submitDto.ultrasoundOrders && submitDto.ultrasoundOrders.length > 0) {
      for (const scanType of submitDto.ultrasoundOrders) {
        await this.ultrasoundRequestModel.create({
          appointmentId: appt.id,
          patientId: appt.patientId,
          requestedByUserId: doctorId,
          scanType: scanType,
          status: 'PENDING',
        } as any);
      }
    }

    // 5. Complete Appointment
    appt.status = 'COMPLETED';
    await appt.save();

    return this.findOne(consultation.id);
  }

  async findOne(id: number): Promise<Consultation> {
    const consultation = await this.consultationModel.findByPk(id, {
      include: [
        {
          model: Prescription,
          include: [{ model: PrescriptionItem }],
        },
        { model: Appointment, include: [{ model: Patient }, { model: Vitals }] },
      ],
    });
    if (!consultation) {
      throw new BadRequestException('Consultation record not found');
    }
    return consultation;
  }

  async findByPatientId(patientId: number): Promise<Consultation[]> {
    return this.consultationModel.findAll({
      where: { patientId },
      include: [
        {
          model: Prescription,
          include: [{ model: PrescriptionItem }],
        },
        { model: Appointment, include: [{ model: Vitals }] },
      ],
      order: [['createdAt', 'DESC']],
    });
  }
}
