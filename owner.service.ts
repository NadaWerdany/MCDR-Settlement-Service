import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  SettlementRequestEntity,
  SettlementRequestStatus,
} from './entities/settlement-request.entity';
import { MeetingEntity } from './entities/meeting.entity';
import { CreateSettlementRequestDto } from './dto/create-settlement-request.dto';

const ACTIVE_STATUSES = [
  SettlementRequestStatus.IN_PROGRESS,
  SettlementRequestStatus.AWAITING_PAYMENT,
  SettlementRequestStatus.PAID,
];

@Injectable()
export class OwnerService {
  constructor(
    @InjectRepository(SettlementRequestEntity)
    private readonly settlementRequestRepository: Repository<SettlementRequestEntity>,

    @InjectRepository(MeetingEntity)
    private readonly meetingRepository: Repository<MeetingEntity>,
  ) {}

  async checkCrn(crn: string) {
    const normalizedCrn = this.normalizeCrn(crn);
    const activeRequest = await this.findActiveRequestByCrn(normalizedCrn);

    return {
      crn: normalizedCrn,
      needsSettlement: !activeRequest,
      eligible: !activeRequest,
      hasActiveRequest: !!activeRequest,
      activeRequestId: activeRequest?.id ?? null,
    };
  }

  async createSettlementRequest(dto: CreateSettlementRequestDto) {
    const crn = this.normalizeCrn(dto.crn);
    this.validateMeetings(dto.meetings);

    const existingRequest = await this.findActiveRequestByCrn(crn);

    if (existingRequest) {
      throw new ConflictException(
        'Owner already has an active settlement request',
      );
    }

    const settlementRequest = this.settlementRequestRepository.create({
      crn,
      status: SettlementRequestStatus.IN_PROGRESS,
    });

    const savedRequest =
      await this.settlementRequestRepository.save(settlementRequest);

    const meetings = dto.meetings.map((meeting) =>
      this.meetingRepository.create({
        meetingDate: new Date(meeting.meetingDate),
        companyCapital: Number(meeting.companyCapital),
        attachmentUrl: meeting.attachmentUrl.trim(),
        settlementRequest: savedRequest,
      }),
    );

    await this.meetingRepository.save(meetings);

    return {
      id: savedRequest.id,
      crn: savedRequest.crn,
      status: savedRequest.status,
      meetings,
    };
  }

  async getSettlementRequest(crn: string) {
    const normalizedCrn = this.normalizeCrn(crn);
    const settlementRequest =
      await this.settlementRequestRepository.findOne({
        where: { crn: normalizedCrn },
        relations: { meetings: true },
        order: { createdAt: 'DESC' },
      });

    if (!settlementRequest) {
      throw new NotFoundException('Settlement request not found');
    }

    return settlementRequest;
  }

  async uploadMeetingAttachment(
    meetingId: number,
    file: { buffer: Buffer; originalname: string },
  ) {
    const meeting = await this.meetingRepository.findOne({
      where: { id: meetingId },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    if (!file?.buffer?.length) {
      throw new BadRequestException('Attachment file is required');
    }

    const uploadDir = join(process.cwd(), 'uploads', 'meetings');
    await mkdir(uploadDir, { recursive: true });

    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${randomUUID()}-${safeName}`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, file.buffer);

    meeting.attachmentUrl = `/uploads/meetings/${fileName}`;
    return this.meetingRepository.save(meeting);
  }

  private async findActiveRequestByCrn(crn: string) {
    return this.settlementRequestRepository.findOne({
      where: { crn, status: In(ACTIVE_STATUSES) },
    });
  }

  private normalizeCrn(crn: string) {
    if (typeof crn !== 'string') {
      throw new BadRequestException('CRN is required');
    }

    const normalizedCrn = crn.trim();

    if (!/^[A-Za-z0-9-]{3,50}$/.test(normalizedCrn)) {
      throw new BadRequestException(
        'CRN must contain 3-50 letters, numbers, or hyphens',
      );
    }

    return normalizedCrn;
  }

  private validateMeetings(meetings: CreateSettlementRequestDto['meetings']) {
    if (!Array.isArray(meetings) || meetings.length === 0) {
      throw new BadRequestException(
        'At least one meeting is required for a settlement request',
      );
    }

    for (const [index, meeting] of meetings.entries()) {
      if (!meeting?.meetingDate || Number.isNaN(Date.parse(meeting.meetingDate))) {
        throw new BadRequestException(
          `Meeting ${index + 1}: meetingDate must be a valid date/time`,
        );
      }

      const capital = Number(meeting.companyCapital);
      if (!Number.isFinite(capital) || capital <= 0) {
        throw new BadRequestException(
          `Meeting ${index + 1}: companyCapital must be greater than zero`,
        );
      }

      if (!meeting.attachmentUrl?.trim()) {
        throw new BadRequestException(
          `Meeting ${index + 1}: attachmentUrl is required`,
        );
      }
    }
  }
}
