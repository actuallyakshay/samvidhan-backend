import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationInputDto } from 'src/data/dto';

export class ReviewLawyerDocumentDto {
  @ApiProperty({ enum: [true, false] })
  @IsIn([true, false])
  isApproved: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  rejectionReason?: string;
}

export class GetLawyerPendingDocumentsQueryDto extends PaginationInputDto {}
