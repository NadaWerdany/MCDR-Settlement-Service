import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

import { SettlementRequestEntity } from '../owner/entities/settlement-request.entity';
import { MeetingEntity } from '../owner/entities/meeting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SettlementRequestEntity,
      MeetingEntity,
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}