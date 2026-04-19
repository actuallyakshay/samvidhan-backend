import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { RazorpayController } from './razorpay.controller';
import { RazorpayWebhookController } from './razorpay-webhook.controller';
import { RazorpayWebhookGuard } from './guards/razorpay-webhook.guard';
import { RazorpayService } from './razorpay.service';

@Module({
  imports: [AuthModule],
  controllers: [RazorpayController, RazorpayWebhookController],
  providers: [RazorpayService, RazorpayWebhookGuard],
  exports: [RazorpayService],
})
export class RazorpayModule {}
