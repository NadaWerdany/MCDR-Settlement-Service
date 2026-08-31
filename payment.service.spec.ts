import { BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { SettlementRequestStatus } from '../owner/entities/settlement-request.entity';

describe('PaymentService', () => {
  const settlementRequestRepository = {
    findOne: jest.fn(),
    save: jest.fn(async (value) => value),
  };

  let service: PaymentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PaymentService(settlementRequestRepository as any);
  });

  it('returns the payment summary with per-meeting fees and total', async () => {
    settlementRequestRepository.findOne.mockResolvedValue({
      id: 1,
      crn: 'CRN-123',
      status: SettlementRequestStatus.AWAITING_PAYMENT,
      meetings: [
        { id: 11, meetingDate: new Date('2025-01-01'), fee: 100 },
        { id: 12, meetingDate: new Date('2025-02-01'), fee: 250.5 },
      ],
    });

    await expect(service.getPaymentSummary(1)).resolves.toMatchObject({
      settlementRequestId: 1,
      total: 350.5,
    });
  });

  it('does not allow payment before awaiting payment', async () => {
    settlementRequestRepository.findOne.mockResolvedValue({
      id: 1,
      status: SettlementRequestStatus.IN_PROGRESS,
      meetings: [],
    });

    await expect(service.paySettlementRequest(1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('marks an awaiting request as paid and returns the total', async () => {
    settlementRequestRepository.findOne.mockResolvedValue({
      id: 1,
      crn: 'CRN-123',
      status: SettlementRequestStatus.AWAITING_PAYMENT,
      meetings: [{ fee: 100 }, { fee: 200 }],
    });

    await expect(service.paySettlementRequest(1)).resolves.toMatchObject({
      status: SettlementRequestStatus.PAID,
      amountPaid: 300,
    });
  });
});
