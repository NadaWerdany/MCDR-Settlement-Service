import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';

import { SettlementRequestStatus } from '../owner/entities/settlement-request.entity';
import { BackofficeService } from './backoffice.service';

@Controller('backoffice')
export class BackofficeController {
  constructor(
    private readonly backofficeService: BackofficeService,
  ) {}

  @Get('settlement-requests')
  getSettlementRequests(
    @Query('status') status?: SettlementRequestStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.backofficeService.getSettlementRequests(
      status,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }

  @Get('settlement-requests/:id')
  getSettlementRequestById(@Param('id') id: string) {
    return this.backofficeService.getSettlementRequestById(
      Number(id),
    );
  }

  @Patch('meetings/:id/fee')
  setMeetingFee(
    @Param('id') id: string,
    @Body('fee') fee: number,
  ) {
    return this.backofficeService.setMeetingFee(
      Number(id),
      Number(fee),
    );
  }

  @Patch('settlement-requests/:id/status')
  updateSettlementRequestStatus(
    @Param('id') id: string,
    @Body('status') status: SettlementRequestStatus,
  ) {
    return this.backofficeService.updateSettlementRequestStatus(
      Number(id),
      status,
    );
  }
}