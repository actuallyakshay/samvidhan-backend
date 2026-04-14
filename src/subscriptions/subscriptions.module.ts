import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, JwtService],
})
export class SubscriptionsModule {}
