import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import {
  MAX_CHAT_ASSET_NAME_LENGTH,
  MAX_CHAT_ASSET_URL_LENGTH,
  MAX_CHAT_TEXT_LENGTH,
} from '../case-chat.constants';

export class ChatSendDto {
  @IsUUID()
  caseId: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_CHAT_TEXT_LENGTH)
  text?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_CHAT_ASSET_URL_LENGTH)
  assetUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_CHAT_ASSET_NAME_LENGTH)
  assetName?: string;

  @IsOptional()
  @IsUUID()
  clientMessageId?: string;
}
