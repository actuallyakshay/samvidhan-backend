import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  CallType,
  CaseSessionRequestRaisedBy,
} from 'src/data/entities/case-session-request.entity';

export class CreateCaseSessionRequestInput {
  @ApiProperty({ description: 'Case ID' })
  @IsString()
  @IsNotEmpty()
  caseId: string;

  @ApiProperty({ description: 'Requested date' })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  requestedDate: Date;

  @ApiProperty({ description: 'Requested time' })
  @IsString()
  @IsNotEmpty()
  requestedTime: string;

  @ApiPropertyOptional({ description: 'Call type' })
  @IsEnum(CallType)
  @IsOptional()
  callType: CallType;

  @ApiProperty({ description: 'Raised by', default: CaseSessionRequestRaisedBy.USER })
  @IsEnum(CaseSessionRequestRaisedBy)
  @IsOptional()
  raisedBy: CaseSessionRequestRaisedBy;
}
