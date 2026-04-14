import { IsUUID } from 'class-validator';

export class ChatJoinDto {
  @IsUUID()
  caseId: string;
}
