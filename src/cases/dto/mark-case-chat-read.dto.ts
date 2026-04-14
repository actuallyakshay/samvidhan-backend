import { IsOptional, IsUUID } from 'class-validator';

export class MarkCaseChatReadDto {
  @IsOptional()
  @IsUUID()
  messageId?: string;
}
