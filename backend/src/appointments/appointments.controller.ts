import { Controller, Get, Post, Body, Param, Put, UseGuards, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles('ADMIN', 'RECEPTIONIST')
  create(@Body() createDto: any) {
    return this.appointmentsService.create(createDto);
  }

  @Get()
  @Roles('ADMIN', 'RECEPTIONIST', 'MEDICAL_OFFICER', 'DOCTOR')
  findAll(
    @Query('status') status?: string,
    @Query('doctorId') doctorId?: string,
    @Query('date') date?: string,
  ) {
    return this.appointmentsService.findAll(status, doctorId ? +doctorId : undefined, date);
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPTIONIST', 'MEDICAL_OFFICER', 'DOCTOR')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(+id);
  }

  @Put(':id/status')
  @Roles('ADMIN', 'RECEPTIONIST', 'MEDICAL_OFFICER', 'DOCTOR')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.appointmentsService.updateStatus(+id, status);
  }
}
