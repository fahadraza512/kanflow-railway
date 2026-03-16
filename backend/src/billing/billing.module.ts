import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { Invoice } from './entities/invoice.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { Workspace } from '../workspaces/entities/workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, PaymentMethod, Workspace])],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
