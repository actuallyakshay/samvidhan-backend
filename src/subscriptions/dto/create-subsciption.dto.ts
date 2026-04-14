import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BillingCycle } from 'src/enums';

export class CreateSubscriptionPlanInput {
  @ApiProperty({ example: 'Basic' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Basic subscription plan' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiPropertyOptional({ example: 'Feature 1;Feature 2;Feature 3' })
  @IsOptional()
  @IsString()
  features?: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsNotEmpty()
  priceInr: number;

  @ApiProperty({ example: BillingCycle.MONTHLY })
  @IsEnum(BillingCycle)
  @IsNotEmpty()
  billingCycle: BillingCycle;
}
