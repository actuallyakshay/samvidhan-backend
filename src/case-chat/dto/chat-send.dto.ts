import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { MAX_CHAT_TEXT_LENGTH } from '../case-chat.constants';

export class ChatSendDto {
  @IsUUID()
  caseId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(MAX_CHAT_TEXT_LENGTH)
  text: string;

  @IsOptional()
  @IsString()
  clientMessageId?: string;
}
