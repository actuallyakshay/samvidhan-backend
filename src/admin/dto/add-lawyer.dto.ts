import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AddLawyerInput {
  @ApiPropertyOptional({ description: 'Full name of the lawyer' })
  @IsString()
  @IsOptional()
  fullName: string;

  @ApiPropertyOptional({ description: 'Phone number of the lawyer' })
  @IsString()
  @MaxLength(10)
  @IsOptional()
  phone: string;

  @ApiProperty({ description: 'Email address of the lawyer' })
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ description: 'Password of the lawyer' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ description: 'Bar council ID of the lawyer' })
  @IsString()
  @IsOptional()
  barCouncilId?: string;

  @ApiPropertyOptional({ description: 'Career start date of the lawyer' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  careerStartDate?: Date;

  @ApiPropertyOptional({ description: 'Bio of the lawyer' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ description: 'Degree of the lawyer' })
  @IsString()
  @IsOptional()
  degree?: string;

  @ApiPropertyOptional({ example: ['1234567890'] })
  @IsArray()
  @IsOptional()
  @IsUUID('all', { each: true })
  lawyerPracticeAreas?: string[];
}
