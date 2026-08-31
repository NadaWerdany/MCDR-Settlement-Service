import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackofficeController } from './backoffice.controller';
import { BackofficeService } from './backoffice.service';

import { SettlementRequestEntity } from '../owner/entities/settlement-request.entity';
import { MeetingEntity } from '../owner/entities/meeting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SettlementRequestEntity,
      MeetingEntity,
    ]),
  ],
  controllers: [BackofficeController],
  providers: [BackofficeService],
})
export class BackofficeModule {}