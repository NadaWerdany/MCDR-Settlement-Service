import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  SettlementRequestEntity,
  SettlementRequestStatus,
} from '../owner/entities/settlement-request.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(SettlementRequestEntity)
    private readonly settlementRequestRepository: Repository<SettlementRequestEntity>,
  ) {}

  async getPaymentSummary(id: number) {
    const settlementRequest =
      await this.settlementRequestRepository.findOne({
        where: { id },
        relations: { meetings: true },
      });

    if (!settlementRequest) {
      throw new NotFoundException('Settlement request not found');
    }

    if (settlementRequest.status !== SettlementRequestStatus.AWAITING_PAYMENT) {
      throw new BadRequestException(
        'Payment summary is only available when the settlement request is awaiting payment',
      );
    }

    const meetings = settlementRequest.meetings || [];
    const missingFee = meetings.some(
      (meeting) => meeting.fee === null || Number(meeting.fee) < 0,
    );

    if (meetings.length === 0 || missingFee) {
      throw new BadRequestException(
        'All meetings must have a valid fee before payment',
      );
    }

    const total = meetings.reduce(
      (sum, meeting) => sum + Number(meeting.fee),
      0,
    );

    return {
      settlementRequestId: settlementRequest.id,
      crn: settlementRequest.crn,
      status: settlementRequest.status,
      meetings: meetings.map((meeting) => ({
        meetingId: meeting.id,
        meetingDate: meeting.meetingDate,
        fee: Number(meeting.fee),
      })),
      total,
    };
  }

  async paySettlementRequest(id: number) {
    const settlementRequest =
      await this.settlementRequestRepository.findOne({
        where: { id },
        relations: { meetings: true },
      });

    if (!settlementRequest) {
      throw new NotFoundException('Settlement request not found');
    }

    if (settlementRequest.status !== SettlementRequestStatus.AWAITING_PAYMENT) {
      throw new BadRequestException(
        'Payment is only allowed when the settlement request is AWAITING_PAYMENT',
      );
    }

    const meetings = settlementRequest.meetings || [];
    if (meetings.length === 0 || meetings.some((meeting) => meeting.fee === null)) {
      throw new BadRequestException(
        'All meetings must have a fee before payment',
      );
    }

    const total = meetings.reduce(
      (sum, meeting) => sum + Number(meeting.fee),
      0,
    );

    settlementRequest.status = SettlementRequestStatus.PAID;

    const savedRequest =
      await this.settlementRequestRepository.save(settlementRequest);

    return {
      id: savedRequest.id,
      crn: savedRequest.crn,
      status: savedRequest.status,
      amountPaid: total,
      message: 'Payment completed successfully',
    };
  }
}
