import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { RazorpayService } from '../razorpay.service';

@Injectable()
export class RazorpayWebhookGuard implements CanActivate {
  constructor(private readonly razorpay: RazorpayService) {}

  canActivate(context: ExecutionContext): true {
    const req = context.switchToHttp().getRequest<Request & { rawBody?: Buffer }>();
    const raw = req.rawBody?.toString('utf8');
    if (!raw) {
      throw new BadRequestException('Missing raw body for webhook verification');
    }
    const signature = req.headers['x-razorpay-signature'];
    const sig = Array.isArray(signature) ? signature[0] : signature;
    if (!sig?.trim()) {
      throw new BadRequestException('Missing Razorpay signature');
    }
    this.razorpay.verifyWebhookSignature(raw, sig);
    return true;
  }
}
