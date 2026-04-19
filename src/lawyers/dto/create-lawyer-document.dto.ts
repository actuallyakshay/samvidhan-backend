import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLawyerDocumentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(4096)
  assetUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  assetName?: string;
}
