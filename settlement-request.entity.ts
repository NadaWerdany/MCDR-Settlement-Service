import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MeetingEntity } from './meeting.entity';

export enum SettlementRequestStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
  SETTLED = 'SETTLED',
}

@Entity('settlement_requests')
@Index(['crn', 'status'])
export class SettlementRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  crn: string;

  @Column({
    type: 'enum',
    enum: SettlementRequestStatus,
    default: SettlementRequestStatus.IN_PROGRESS,
  })
  status: SettlementRequestStatus;

  @OneToMany(
    () => MeetingEntity,
    (meeting) => meeting.settlementRequest,
  )
  meetings: MeetingEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
