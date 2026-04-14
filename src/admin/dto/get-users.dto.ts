import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { PaginationInputDto } from 'src/data/dto/pagination.dto';
import { AccountStatus } from 'src/enums';

export class GetUsersQueryDto extends PaginationInputDto {
  @ApiPropertyOptional({ description: 'Search by name, email or phone' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by account status',
    enum: AccountStatus,
  })
  @IsEnum(AccountStatus)
  @IsOptional()
  status?: AccountStatus;
}

export class CreateUserInput {
  @ApiPropertyOptional({ description: 'Full name' })
  @IsString()
  @IsOptional()
  fullName: string;

  @ApiProperty({ description: 'Email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ description: 'Phone' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
