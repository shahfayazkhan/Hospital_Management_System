import { Controller, Get, Post, Body, Param, Put, UseGuards, Request, Query } from '@nestjs/common';
import { LabService } from './lab.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('lab')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LabController {
  constructor(private readonly labService: LabService) {}

  @Get()
  @Roles('ADMIN', 'LAB_TECHNICIAN', 'DOCTOR')
  findAll(@Query('status') status?: string) {
    return this.labService.findAll(status);
  }

  @Get(':id')
  @Roles('ADMIN', 'LAB_TECHNICIAN', 'DOCTOR')
  findOne(@Param('id') id: string) {
    return this.labService.findOne(+id);
  }

  @Put(':id/results')
  @Roles('ADMIN', 'LAB_TECHNICIAN')
  submitResults(@Param('id') id: string, @Body('findings') findings: string, @Request() req) {
    return this.labService.submitResults(+id, findings, req.user.id);
  }
}
