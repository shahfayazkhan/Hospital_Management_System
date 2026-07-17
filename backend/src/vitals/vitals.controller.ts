import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { VitalsService } from './vitals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('vitals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VitalsController {
  constructor(private readonly vitalsService: VitalsService) {}

  @Post()
  @Roles('ADMIN', 'MEDICAL_OFFICER')
  record(@Body() recordDto: any, @Request() req) {
    return this.vitalsService.record(recordDto, req.user.id);
  }

  @Get('appointment/:appointmentId')
  @Roles('ADMIN', 'MEDICAL_OFFICER', 'DOCTOR')
  findByAppointment(@Param('appointmentId') appointmentId: string) {
    return this.vitalsService.findByAppointmentId(+appointmentId);
  }
}
