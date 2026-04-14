import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { CaseSessionRequestRaisedBy } from 'src/data/entities/case-session-request.entity';
import { AssetType } from 'src/enums';
import { AssetAuthor } from 'src/types';

export class DocumentInput {
  @ApiProperty({
    description: 'Pre-uploaded asset URL',
    example: 'https://storage.googleapis.com/...',
  })
  @IsUrl()
  @IsNotEmpty()
  assetUrl: string;

  @ApiProperty({ description: 'Asset type', example: AssetType.PDF })
  @IsEnum(AssetType)
  @IsNotEmpty()
  assetType: AssetType;

  @ApiProperty({ description: 'Asset name', example: 'document.pdf' })
  @IsString()
  @IsOptional()
  assetName?: string;
}

export class CreateCaseInput {
  @ApiProperty({ description: 'Practice area ID (category)' })
  @IsUUID()
  @IsNotEmpty()
  practiceAreaId: string;

  @ApiProperty({ description: 'Brief title of the legal query' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Detailed description of the legal query' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'Mark as emergency', default: false })
  @IsBoolean()
  @IsOptional()
  isEmergency?: boolean;

  @ApiPropertyOptional({
    description: 'Pre-uploaded asset URLs with their types',
    type: [DocumentInput],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentInput)
  @IsOptional()
  documents?: DocumentInput[];
}

export class CreateCaseNoteInput {
  @ApiProperty({ description: 'Note content' })
  @IsString()
  @IsNotEmpty()
  note: string;

  @ApiProperty({ description: 'Author of the note', enum: CaseSessionRequestRaisedBy })
  @IsEnum(CaseSessionRequestRaisedBy)
  @IsNotEmpty()
  author: CaseSessionRequestRaisedBy;
}

export class UploadCaseDocumentInput {
  @ApiProperty({ description: 'Asset URL' })
  @IsNotEmpty()
  @IsUrl()
  assetUrl: string;

  @ApiProperty({ description: 'Asset type', enum: AssetType })
  @IsEnum(AssetType)
  @IsNotEmpty()
  assetType: AssetType;

  @ApiProperty({ description: 'Asset name', example: 'document.pdf' })
  @IsString()
  @IsOptional()
  assetName?: string;

  @ApiProperty({ description: 'Author', enum: AssetAuthor })
  @IsEnum(AssetAuthor)
  @IsNotEmpty()
  author: AssetAuthor;
}
