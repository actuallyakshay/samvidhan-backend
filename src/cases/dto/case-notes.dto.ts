import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationInputDto } from 'src/data/dto';
import { CaseSessionRequestRaisedBy } from 'src/data/entities/case-session-request.entity';

export class GetInternalNotesQueryDto extends PaginationInputDto {
  @ApiPropertyOptional({ description: 'Author', enum: CaseSessionRequestRaisedBy })
  @IsEnum(CaseSessionRequestRaisedBy)
  @IsOptional()
  author?: CaseSessionRequestRaisedBy;
}
