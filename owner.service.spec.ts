import { ConflictException } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { SettlementRequestStatus } from './entities/settlement-request.entity';

describe('OwnerService', () => {
  const settlementRequestRepository = {
    findOne: jest.fn(),
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => ({ id: 1, ...value })),
  };

  const meetingRepository = {
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => value),
    findOne: jest.fn(),
  };

  let service: OwnerService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OwnerService(
      settlementRequestRepository as any,
      meetingRepository as any,
    );
  });

  it('returns eligible when there is no active request for the CRN', async () => {
    settlementRequestRepository.findOne.mockResolvedValue(null);

    await expect(service.checkCrn('  CRN-123  ')).resolves.toEqual({
      crn: 'CRN-123',
      needsSettlement: true,
      eligible: true,
      hasActiveRequest: false,
      activeRequestId: null,
    });
  });

  it('blocks creation when an active request already exists', async () => {
    settlementRequestRepository.findOne.mockResolvedValue({
      id: 10,
      status: SettlementRequestStatus.IN_PROGRESS,
    });

    await expect(
      service.createSettlementRequest({
        crn: 'CRN-123',
        meetings: [
          {
            meetingDate: '2025-01-01T10:00:00Z',
            companyCapital: 100000,
            attachmentUrl: '/files/meeting.pdf',
          },
        ],
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects a request with no meetings', async () => {
    settlementRequestRepository.findOne.mockResolvedValue(null);

    await expect(
      service.createSettlementRequest({ crn: 'CRN-123', meetings: [] }),
    ).rejects.toThrow('At least one meeting is required');
  });

  it('creates a request and its meetings', async () => {
    settlementRequestRepository.findOne.mockResolvedValue(null);

    const result = await service.createSettlementRequest({
      crn: 'CRN-123',
      meetings: [
        {
          meetingDate: '2025-01-01T10:00:00Z',
          companyCapital: 100000,
          attachmentUrl: '/files/meeting.pdf',
        },
      ],
    });

    expect(settlementRequestRepository.save).toHaveBeenCalled();
    expect(meetingRepository.save).toHaveBeenCalled();
    expect(result.status).toBe(SettlementRequestStatus.IN_PROGRESS);
    expect(result.meetings).toHaveLength(1);
  });
});
