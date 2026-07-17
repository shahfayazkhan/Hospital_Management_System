import { Controller, Get, Body, Param, Put, UseGuards, Request, Query } from '@nestjs/common';
import { UltrasoundService } from './ultrasound.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('ultrasound')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UltrasoundController {
  constructor(private readonly ultrasoundService: UltrasoundService) {}

  @Get()
  @Roles('ADMIN', 'ULTRASOUND_TECHNICIAN', 'DOCTOR')
  findAll(@Query('status') status?: string) {
    return this.ultrasoundService.findAll(status);
  }

  @Get(':id')
  @Roles('ADMIN', 'ULTRASOUND_TECHNICIAN', 'DOCTOR')
  findOne(@Param('id') id: string) {
    return this.ultrasoundService.findOne(+id);
  }

  @Put(':id/results')
  @Roles('ADMIN', 'ULTRASOUND_TECHNICIAN')
  submitResults(@Param('id') id: string, @Body() submitDto: any, @Request() req) {
    return this.ultrasoundService.submitResults(+id, submitDto, req.user.id);
  }
}
