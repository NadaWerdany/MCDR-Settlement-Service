import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import {
  SettlementRequestEntity,
  SettlementRequestStatus,
} from '../owner/entities/settlement-request.entity';

import { MeetingEntity } from '../owner/entities/meeting.entity';

@Injectable()
export class BackofficeService {
  constructor(
    @InjectRepository(SettlementRequestEntity)
    private readonly settlementRequestRepository: Repository<SettlementRequestEntity>,

    @InjectRepository(MeetingEntity)
    private readonly meetingRepository: Repository<MeetingEntity>,
  ) {}

  async getSettlementRequests(
    status?: SettlementRequestStatus,
    page = 1,
    limit = 10,
  ) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(limit, 100));

    const where = status
      ? { status }
      : {
          status: In([
            SettlementRequestStatus.IN_PROGRESS,
            SettlementRequestStatus.AWAITING_PAYMENT,
            SettlementRequestStatus.PAID,
            SettlementRequestStatus.REJECTED,
            SettlementRequestStatus.SETTLED,
          ]),
        };

    const [requests, total] =
      await this.settlementRequestRepository.findAndCount({
        where,
        relations: {
          meetings: true,
        },
        order: {
          createdAt: 'DESC',
        },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      });

    return {
      data: requests,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async getSettlementRequestById(id: number) {
    const request = await this.settlementRequestRepository.findOne({
      where: {
        id,
      },
      relations: {
        meetings: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Settlement request not found');
    }

    return request;
  }

  async setMeetingFee(meetingId: number, fee: number) {
    const meeting = await this.meetingRepository.findOne({
      where: {
        id: meetingId,
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    meeting.fee = fee;

    return this.meetingRepository.save(meeting);
  }

  async updateSettlementRequestStatus(
    id: number,
    status: SettlementRequestStatus,
  ) {
    const request = await this.settlementRequestRepository.findOne({
      where: {
        id,
      },
      relations: {
        meetings: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Settlement request not found');
    }

    request.status = status;

    return this.settlementRequestRepository.save(request);
  }
}