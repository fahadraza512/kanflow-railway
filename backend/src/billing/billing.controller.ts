import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('invoices')
  getInvoices(@Query('workspaceId') workspaceId: string, @CurrentUser() user: any) {
    return this.billingService.getInvoices(workspaceId, user.userId);
  }

  @Get('invoices/:id')
  getInvoice(@Param('id') id: string, @CurrentUser() user: any) {
    return this.billingService.getInvoice(id, user.userId);
  }

  @Get('payment-methods')
  getPaymentMethods(@Query('workspaceId') workspaceId: string, @CurrentUser() user: any) {
    return this.billingService.getPaymentMethods(workspaceId, user.userId);
  }

  @Delete('payment-methods/:id')
  removePaymentMethod(@Param('id') id: string, @CurrentUser() user: any) {
    return this.billingService.removePaymentMethod(id, user.userId);
  }
}
