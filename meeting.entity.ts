import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { SettlementRequestEntity } from './settlement-request.entity';

@Entity('meetings')
export class MeetingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  meetingDate: Date;

  @Column('decimal', {
    precision: 15,
    scale: 2,
  })
  companyCapital: number;

  @Column()
  attachmentUrl: string;

  @Column('decimal', {
    precision: 15,
    scale: 2,
    nullable: true,
  })
  fee: number | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  settlementDocumentUrl: string | null;

  @ManyToOne(
    () => SettlementRequestEntity,
    (settlementRequest) => settlementRequest.meetings,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'settlementRequestId',
  })
  settlementRequest: SettlementRequestEntity;
}