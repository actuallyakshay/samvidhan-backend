import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationInputDto } from 'src/data/dto/pagination.dto';
import { CaseStatus } from 'src/enums';

export class GetCasesQueryDto extends PaginationInputDto {
  @ApiPropertyOptional({ description: 'Search by title or case code' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by case status',
    enum: CaseStatus,
  })
  @IsEnum(CaseStatus)
  @IsOptional()
  status?: CaseStatus;
}

export class GetCasesDocumentsQueryDto extends PaginationInputDto {}
