import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsInput {
  @ApiPropertyOptional({ example: 'support@example.com' })
  @IsString()
  @IsEmail()
  @IsOptional()
  supportEmail?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  supportPhone?: string;
}
