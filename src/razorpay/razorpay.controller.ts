import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators';
import type { AuthenticatedUser } from 'src/types';
import { StartRazorpaySubscriptionDto } from './dto/start-razorpay-subscription.dto';
import { RazorpayService } from './razorpay.service';

@ApiTags('Razorpay')
@Controller('razorpay')
export class RazorpayController {
  constructor(private readonly razorpay: RazorpayService) {}

  @Get('subscriptions/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Active paid subscription for the current user (for UI gating)' })
  getMyActiveSubscription(@CurrentUser() user: AuthenticatedUser) {
    return this.razorpay.getActiveSubscriptionForUser(user.sub);
  }

  @Post('subscriptions/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  start(@CurrentUser() user: AuthenticatedUser, @Body() dto: StartRazorpaySubscriptionDto) {
    return this.razorpay.startSubscription(user.sub, dto);
  }
}
