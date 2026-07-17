import { Controller, Get, Param, Put, Body, UseGuards, Query } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get()
  @Roles('ADMIN', 'RECEPTIONIST')
  findAll(@Query('status') status?: string) {
    return this.billingService.findAll(status);
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPTIONIST')
  findOne(@Param('id') id: string) {
    return this.billingService.findOne(+id);
  }

  @Put(':id/pay')
  @Roles('ADMIN', 'RECEPTIONIST')
  pay(@Param('id') id: string, @Body('paymentMethod') paymentMethod: string) {
    return this.billingService.pay(+id, paymentMethod);
  }
}
