import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetLawyerVerificationDto {
  @ApiProperty()
  @IsBoolean()
  isVerified: boolean;
}
