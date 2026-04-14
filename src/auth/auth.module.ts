import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MailModule } from 'src/mail/mail.module';
import { AdminOtpService } from './admin-otp.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtUserContextService } from './jwt-user-context.service';

@Module({
  imports: [
    MailModule,
    ThrottlerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_ACCESS_EXPIRY') || '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AdminOtpService, JwtUserContextService, JwtAuthGuard],
  exports: [JwtModule, AuthService, JwtUserContextService, JwtAuthGuard],
})
export class AuthModule {}
