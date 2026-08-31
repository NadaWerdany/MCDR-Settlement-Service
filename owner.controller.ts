import {
  Body,
  Controller,
  BadRequestException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OwnerService } from './owner.service';
import { CreateSettlementRequestDto } from './dto/create-settlement-request.dto';

@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Get('crn')
  checkCrn(@Query('crn') crn: string) {
    return this.ownerService.checkCrn(crn);
  }

  @Post('settlement-request')
  createSettlementRequest(@Body() dto: CreateSettlementRequestDto) {
    return this.ownerService.createSettlementRequest(dto);
  }

  @Get('settlement-request')
  getSettlementRequest(@Query('crn') crn: string) {
    return this.ownerService.getSettlementRequest(crn);
  }

  @Post('meetings/:id/attachment')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_request, file, callback) => {
        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
        ];

        if (!allowedTypes.includes(file.mimetype)) {
          callback(
            new BadRequestException(
              'Only PDF, JPEG, and PNG attachments are allowed',
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  uploadMeetingAttachment(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: { buffer: Buffer; originalname: string } | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('Attachment file is required');
    }

    return this.ownerService.uploadMeetingAttachment(id, file);
  }
}
