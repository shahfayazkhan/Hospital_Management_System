import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Billing } from './billing.model';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';

@Module({
  imports: [SequelizeModule.forFeature([Billing])],
  providers: [BillingService],
  controllers: [BillingController],
  exports: [BillingService],
})
export class BillingModule {}
