import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { TokenPayload } from 'google-auth-library';
import { RoleCode } from 'src/enums';
import { IJwtPayload } from 'src/types';
import { REFRESH_TOKEN_COOKIE, clearAuthCookies, setAuthCookies } from './auth-cookies';
import { AuthService } from './auth.service';
import { CurrentUser, GoogleUser, Roles } from './decorators';
import {
  AdminLoginInput,
  AdminResendOtpInput,
  AdminVerifyOtpInput,
  ChangePasswordInput,
  EmailAuthInput,
  GoogleAuthInput,
  RefreshTokenInput,
} from './dto';
import { GoogleAuthGuard, JwtAuthGuard, RolesGuard } from './guards';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  private respondWithAuthCookies(res: Response, result: unknown) {
    if (
      result &&
      typeof result === 'object' &&
      'accessToken' in result &&
      'refreshToken' in result &&
      typeof (result as { accessToken: unknown }).accessToken === 'string' &&
      typeof (result as { refreshToken: unknown }).refreshToken === 'string'
    ) {
      const { accessToken, refreshToken, ...rest } = result as {
        accessToken: string;
        refreshToken: string;
        [key: string]: unknown;
      };
      setAuthCookies(res, { accessToken, refreshToken }, this.configService);
      return rest;
    }
    return result;
  }

  @Post('admin/login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 12, ttl: 60000 } })
  async adminAuth(@Body() body: AdminLoginInput, @Res({ passthrough: true }) res: Response) {
    return this.respondWithAuthCookies(res, await this.authService.adminAuth(body));
  }

  @HttpCode(HttpStatus.OK)
  @Post('admin/login/resend-otp')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  adminResendOtp(@Body() body: AdminResendOtpInput) {
    return this.authService.adminResendOtp(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('admin/login/verify-otp')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 25, ttl: 60000 } })
  async adminVerifyOtp(
    @Body() body: AdminVerifyOtpInput,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.respondWithAuthCookies(res, await this.authService.adminVerifyOtp(body));
  }

  @HttpCode(HttpStatus.OK)
  @Post('email')
  async emailAuth(@Body() body: EmailAuthInput, @Res({ passthrough: true }) res: Response) {
    return this.respondWithAuthCookies(res, await this.authService.emailAuth(body));
  }

  @UseGuards(GoogleAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('google')
  async googleAuth(
    @GoogleUser() googleUser: TokenPayload,
    @Body() body: GoogleAuthInput,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.respondWithAuthCookies(
      res,
      await this.authService.googleAuth({
        googleUser,
        role: body.role,
        fcmToken: body.fcmToken,
      })
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Body() body: RefreshTokenInput,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = body.refreshToken ?? req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }
    const tokens = await this.authService.refreshTokens({ refreshToken });
    setAuthCookies(res, tokens, this.configService);
    return { status: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@CurrentUser() user: IJwtPayload, @Res({ passthrough: true }) res: Response) {
    clearAuthCookies(res, this.configService);
    return this.authService.logout(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.USER, RoleCode.LAWYER)
  @HttpCode(HttpStatus.OK)
  @Patch('change-password')
  changePassword(@Body() body: ChangePasswordInput, @CurrentUser() user: IJwtPayload) {
    return this.authService.changePassword({ userId: user.sub, body });
  }
}
