import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class GetCaseMessagesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 30;

  /** Oldest message id you already have; returns older messages than this. */
  @IsOptional()
  @IsUUID()
  beforeMessageId?: string;
}
