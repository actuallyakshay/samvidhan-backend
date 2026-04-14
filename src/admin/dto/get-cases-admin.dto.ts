import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationInputDto } from 'src/data/dto/pagination.dto';
import { CaseStatus } from 'src/enums';

export class GetCasesAdminQueryDto extends PaginationInputDto {
  @ApiPropertyOptional({ description: 'Search by title, case code or user name' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by case status', enum: CaseStatus })
  @IsEnum(CaseStatus)
  @IsOptional()
  status?: CaseStatus;

  @ApiPropertyOptional({ description: 'Filter by practice area ID' })
  @IsUUID()
  @IsOptional()
  practiceAreaId?: string;
}
