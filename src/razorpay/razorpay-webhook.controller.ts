import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';
import { RazorpayWebhookGuard } from './guards/razorpay-webhook.guard';
import { RazorpayService } from './razorpay.service';

@ApiExcludeController()
@Controller('razorpay')
export class RazorpayWebhookController {
  constructor(private readonly razorpay: RazorpayService) {}

  @Post('webhook')
  @UseGuards(RazorpayWebhookGuard)
  async webhook(@Req() req: Request & { rawBody?: Buffer }) {
    const body = JSON.parse(req.rawBody.toString('utf8')) as Record<string, unknown>;
    await this.razorpay.handleWebhookEvent(body);
    return { ok: true };
  }
}
