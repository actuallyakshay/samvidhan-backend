import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class StartRazorpaySubscriptionDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  subscriptionPlanId: string;

  /** Razorpay `total_count`: number of billing cycles to charge. */
  @ApiProperty({ example: 12, minimum: 1 })
  @IsInt()
  @Min(1)
  @Max(999)
  totalCount: number;
}
