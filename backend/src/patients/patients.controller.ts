import { Controller, Get, Post, Body, Param, Put, UseGuards, Query } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @Roles('ADMIN', 'RECEPTIONIST')
  create(@Body() createPatientDto: any) {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @Roles('ADMIN', 'RECEPTIONIST', 'MEDICAL_OFFICER', 'DOCTOR')
  findAll(@Query('search') search?: string) {
    return this.patientsService.findAll(search);
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPTIONIST', 'MEDICAL_OFFICER', 'DOCTOR')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(+id);
  }

  @Put(':id')
  @Roles('ADMIN', 'RECEPTIONIST')
  update(@Param('id') id: string, @Body() updatePatientDto: any) {
    return this.patientsService.update(+id, updatePatientDto);
  }
}
