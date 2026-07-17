import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('consultations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post()
  @Roles('ADMIN', 'DOCTOR')
  create(@Body() submitDto: any, @Request() req) {
    return this.consultationsService.create(submitDto, req.user.id);
  }

  @Get(':id')
  @Roles('ADMIN', 'DOCTOR', 'MEDICAL_OFFICER')
  findOne(@Param('id') id: string) {
    return this.consultationsService.findOne(+id);
  }

  @Get('patient/:patientId')
  @Roles('ADMIN', 'DOCTOR', 'MEDICAL_OFFICER')
  findByPatient(@Param('patientId') patientId: string) {
    return this.consultationsService.findByPatientId(+patientId);
  }
}
