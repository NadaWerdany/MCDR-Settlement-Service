import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  @Get('settlement-requests/:id/summary')
  getPaymentSummary(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.paymentService.getPaymentSummary(id);
  }

  @Post('settlement-requests/:id/pay')
  paySettlementRequest(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.paymentService.paySettlementRequest(id);
  }
}