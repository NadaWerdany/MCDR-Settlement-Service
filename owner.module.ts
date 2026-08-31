import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';
import { SettlementRequestEntity } from './entities/settlement-request.entity';
import { MeetingEntity } from './entities/meeting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SettlementRequestEntity,
      MeetingEntity,
    ]),
  ],
  controllers: [OwnerController],
  providers: [OwnerService],
})
export class OwnerModule {}