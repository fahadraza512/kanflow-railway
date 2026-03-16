import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SalesService } from './sales.service';
import { ContactSalesDto } from './dto/contact-sales.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('contact')
  @HttpCode(HttpStatus.OK)
  async submitContactRequest(@Body() dto: ContactSalesDto) {
    return this.salesService.submitContactRequest(dto);
  }
}
