import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationInputDto } from 'src/data/dto/pagination.dto';
import { UserRoleStatus } from 'src/enums';

export class GetLawyersAdminQueryDto extends PaginationInputDto {
  @ApiPropertyOptional({ description: 'Search by name or enrollment number' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by practice area ID' })
  @IsUUID()
  @IsOptional()
  practiceAreaId?: string;

  @ApiPropertyOptional({ description: 'Filter by role status', enum: UserRoleStatus })
  @IsEnum(UserRoleStatus)
  @IsOptional()
  roleStatus?: UserRoleStatus;
}
