export class CreateSettlementMeetingDto {
  meetingDate: string;
  companyCapital: number;
  attachmentUrl: string;
}

export class CreateSettlementRequestDto {
  crn: string;
  meetings: CreateSettlementMeetingDto[];
}
