import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateConfig } from './config.validator';
import { DataModule } from './data/data.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CasesModule } from './cases/cases.module';
import { LawyersModule } from './lawyers/lawyers.module';
import { AdminModule } from './admin/admin.module';
import { AssetsModule } from './assets/assets.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { GoogleMeetModule } from './google-meet/google-meet.module';
import { CaseChatModule } from './case-chat/case-chat.module';
import { PushModule } from './push/push.module';
import { RazorpayModule } from './razorpay/razorpay.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateConfig }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 200,
      },
    ]),
    DataModule,
    AuthModule,
    UsersModule,
    CasesModule,
    LawyersModule,
    AdminModule,
    AssetsModule,
    SubscriptionsModule,
    GoogleMeetModule,
    CaseChatModule,
    PushModule,
    RazorpayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
