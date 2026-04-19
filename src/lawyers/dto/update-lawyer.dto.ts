import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { UpdateUserInput } from 'src/users/dto';

export class UpdateLawyerInput {
  @ApiPropertyOptional({ type: UpdateUserInput })
  @IsOptional()
  userProfile?: UpdateUserInput;

  @ApiPropertyOptional({ example: 'male' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ example: '1995-01-15' })
  @IsDateString()
  @IsOptional()
  dob?: string;

  @ApiPropertyOptional({ example: 'I am a lawyer with 10 years of experience' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ example: '123 MG Road' })
  @IsString()
  @IsOptional()
  addressLine1?: string;

  @ApiPropertyOptional({ example: 'Near City Mall' })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiPropertyOptional({ example: 'Mumbai' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: '400001' })
  @IsString()
  @MaxLength(10)
  @IsOptional()
  pincode?: string;

  @ApiPropertyOptional({ example: 'B.A., LL.B.' })
  @IsString()
  @IsOptional()
  degree?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  careerStartDate?: Date;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsString()
  @IsOptional()
  barCouncilId?: string;

  @ApiPropertyOptional({ example: ['1234567890'] })
  @IsArray()
  @IsOptional()
  @IsUUID('all', { each: true })
  lawyerPracticeAreas?: string[];

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
}
