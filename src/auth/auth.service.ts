import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { TokenPayload } from 'google-auth-library';
import { UsersEntity } from 'src/data/entities';
import {
  LawyerProfilesRepository,
  RefreshTokensRepository,
  UserRolesRepository,
  UsersRepository,
} from 'src/data/repositories';
import { AccountStatus, RoleCode, UserRoleStatus } from 'src/enums';
import { IJwtPayload, LoginProvider } from 'src/types';
import { MoreThan } from 'typeorm';
import { AdminOtpService } from './admin-otp.service';
import {
  AdminLoginInput,
  AdminResendOtpInput,
  AdminVerifyOtpInput,
  ChangePasswordInput,
  EmailAuthInput,
} from './dto';

@Injectable()
export class AuthService {
  private readonly adminEmails: string[];
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly userRolesRepository: UserRolesRepository,
    private readonly lawyerProfilesRepository: LawyerProfilesRepository,
    private readonly adminOtpService: AdminOtpService
  ) {
    this.adminEmails = this.configService.get('ADMIN_EMAILS').split(',');
  }

  async buildAuthResponse(input: {
    user: UsersEntity;
    roles: RoleCode[];
    isNewUser: boolean;
    isAdmin?: boolean;
  }) {
    const { user, roles, isNewUser, isAdmin } = input;

    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      roles,
      isAdmin,
    });
    await this.storeRefreshToken({
      userId: user.id,
      refreshToken: tokens.refreshToken,
    });

    return {
      status: true,
      ...tokens,
      isNewUser,
      ...(isAdmin ? { isAdmin } : {}),
    };
  }

  async handleExistingUserWhileLoggingIn(input: {
    user: UsersEntity;
    role: RoleCode;
    provider: LoginProvider;
  }) {
    const { user, role, provider } = input;

    if (user.provider !== provider) {
      throw new BadRequestException(`This account uses ${provider} login`);
    }

    const existingRoles = await this.userRolesRepository.find({
      where: { userId: user.id },
    });

    const isToCreateNewRole = !existingRoles.some((ur) => ur.roleCode === role);

    if (isToCreateNewRole) {
      await this.userRolesRepository.save({
        userId: user.id,
        roleCode: role,
        status: role === RoleCode.LAWYER ? UserRoleStatus.PENDING : UserRoleStatus.ACTIVE,
      });
      if (role === RoleCode.LAWYER) {
        await this.lawyerProfilesRepository.save({
          userId: user.id,
          isVerified: false,
        });
        return {
          status: false,
          message:
            'We have received your request to become a lawyer. We will review your request and get back to you soon.',
        };
      }

      return this.buildAuthResponse({ user, roles: [role], isNewUser: false });
    } else {
      const foundExistingRole = existingRoles.find((ur) => ur.roleCode === role);
      if (foundExistingRole) {
        if (foundExistingRole.status !== UserRoleStatus.ACTIVE) {
          return {
            status: false,
            message:
              'We have received your request to become a lawyer. We will review your request and get back to you soon.',
          };
        }
      }
      return this.buildAuthResponse({
        user,
        roles: existingRoles
          .map((ur) => (ur.status === UserRoleStatus.ACTIVE ? ur.roleCode : null))
          .filter(Boolean),
        isNewUser: false,
      });
    }
  }

  async handleNewUserWhileLoggingIn(input: {
    email: string;
    password: string;
    role: RoleCode;
    fcmToken?: string;
    provider?: LoginProvider;
    createdUser?: UsersEntity;
  }) {
    const { email, password, role, fcmToken, provider, createdUser } = input;
    const passwordHash = await bcrypt.hash(password, 12);
    const user =
      createdUser ||
      (await this.usersRepository.save({
        fullName: email?.split?.('@')?.[0] || email,
        email,
        passwordHash,
        provider: provider || LoginProvider.EMAIL,
        fcmToken,
      }));

    await this.userRolesRepository.save({
      userId: user.id,
      roleCode: role,
      status: role === RoleCode.USER ? UserRoleStatus.ACTIVE : UserRoleStatus.PENDING,
    });

    if (role === RoleCode.LAWYER) {
      await this.lawyerProfilesRepository.save({
        userId: user.id,
        isVerified: false,
      });
      return {
        status: false,
        message:
          'We have received your request to become a lawyer. We will review your request and get back to you soon.',
      };
    }

    return this.buildAuthResponse({ user, roles: [RoleCode.USER], isNewUser: true });
  }

  async emailAuth(input: EmailAuthInput) {
    const { email, password, role, fcmToken } = input;

    if (this.adminEmails.includes(email)) {
      return this.adminAuth({ email, password }, LoginProvider.EMAIL);
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      return this.handleExistingUserWhileLoggingIn({
        user: existingUser,
        role,
        provider: LoginProvider.EMAIL,
      });
    }

    return this.handleNewUserWhileLoggingIn({ email, password, role, fcmToken });
  }

  async googleAuth(input: { googleUser: TokenPayload; role: RoleCode; fcmToken?: string }) {
    const { googleUser, role, fcmToken } = input;

    if (this.adminEmails.includes(googleUser.email)) {
      return this.adminAuth({ email: googleUser.email }, LoginProvider.GOOGLE, googleUser);
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: googleUser.email },
    });

    if (existingUser) {
      return this.handleExistingUserWhileLoggingIn({
        user: existingUser,
        role,
        provider: LoginProvider.GOOGLE,
      });
    }

    const createdUser = await this.usersRepository.save({
      fullName: googleUser.name || googleUser.email.split('@')[0],
      email: googleUser.email,
      avatarUrl: googleUser.picture || null,
      provider: LoginProvider.GOOGLE,
    });

    return this.handleNewUserWhileLoggingIn({
      email: googleUser.email,
      password: '',
      role,
      fcmToken,
      createdUser,
    });
  }

  async refreshTokens(input: { refreshToken: string }) {
    const { refreshToken } = input;
    const tokenHash = this.hashToken(refreshToken);

    const storedToken = await this.refreshTokensRepository.findOne({
      where: { tokenHash, expiresAt: MoreThan(new Date()) },
      relations: { user: true },
    });
    if (!storedToken) throw new UnauthorizedException('Invalid or expired refresh token');

    if (storedToken.user.accountStatus === AccountStatus.SUSPENDED) {
      await this.refreshTokensRepository.delete({ userId: storedToken.userId });
      throw new UnauthorizedException('Account is suspended');
    }

    const [, dbRoles] = await Promise.all([
      this.refreshTokensRepository.delete(storedToken.id),
      this.getUserRoles(storedToken.userId),
    ]);

    const isAdmin = storedToken.user.isAdmin;

    const tokens = await this.generateTokens({
      userId: storedToken.userId,
      email: storedToken.user.email,
      roles: isAdmin ? [RoleCode.ADMIN] : [...new Set([...dbRoles])],
      ...(isAdmin ? { isAdmin: true } : {}),
    });
    await this.storeRefreshToken({ userId: storedToken.userId, refreshToken: tokens.refreshToken });

    return tokens;
  }

  async logout(input: IJwtPayload) {
    const { sub: userId } = input;

    await Promise.all([
      this.refreshTokensRepository.delete({ userId }),
      this.usersRepository.update(userId, { fcmToken: null }),
    ]);
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(input: {
    userId: string;
    email: string;
    roles: string[];
    isAdmin?: boolean;
  }) {
    const { userId, email, roles, isAdmin } = input;
    const payload: IJwtPayload = { sub: userId, email, roles, isAdmin };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
        expiresIn: '1h',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRY') || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(input: { userId: string; refreshToken: string }) {
    const { userId, refreshToken } = input;
    const expiryDays = parseInt(this.configService.get('JWT_REFRESH_EXPIRY') || '7', 10) || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    await this.refreshTokensRepository.save({
      userId,
      tokenHash: this.hashToken(refreshToken),
      expiresAt,
    });
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async getUserRoles(userId: string): Promise<string[]> {
    const userRoles = await this.userRolesRepository.find({
      where: { userId, status: UserRoleStatus.ACTIVE },
    });
    return userRoles.map((ur) => ur.roleCode);
  }

  async adminAuth(input: AdminLoginInput, provider?: LoginProvider, googleUser?: TokenPayload) {
    const { email, password } = input;
    if (!this.adminEmails.includes(email)) {
      throw new UnauthorizedException('You are not authorized to access this resource');
    }

    const foundUser = await this.usersRepository.findOne({
      where: { email, isAdmin: true },
    });

    let adminUser: UsersEntity;

    if (!foundUser) {
      if (provider === LoginProvider.EMAIL) {
        adminUser = await this.usersRepository.save({
          fullName: 'Admin',
          email,
          passwordHash: await bcrypt.hash(password, 12),
          isAdmin: true,
          isProfileCompleted: true,
          provider: LoginProvider.EMAIL,
        });
      } else if (provider === LoginProvider.GOOGLE) {
        adminUser = await this.usersRepository.save({
          fullName: googleUser.name || googleUser.email.split('@')[0],
          email: googleUser.email,
          avatarUrl: googleUser.picture || null,
          provider: LoginProvider.GOOGLE,
          isAdmin: true,
          isProfileCompleted: true,
        });
      }
      if (provider === LoginProvider.GOOGLE) {
        return this.buildAuthResponse({
          user: adminUser,
          roles: [RoleCode.ADMIN],
          isNewUser: true,
          isAdmin: true,
        });
      }

      console.log('Sending OTP to admin user', adminUser);
      const { expiresInSeconds } = await this.adminOtpService.sendChallenge(
        adminUser.id,
        adminUser.email
      );
      return {
        status: false,
        requiresOtp: true,
        expiresInSeconds,
        message: 'Enter the 6-digit code your super-admin received by email.',
      };
    }

    const adminUserProvider = foundUser.provider;

    if (adminUserProvider !== provider) {
      throw new UnauthorizedException('Please choose the correct provider to login');
    }

    if (provider === LoginProvider.GOOGLE) {
      return this.buildAuthResponse({
        user: foundUser,
        roles: [RoleCode.ADMIN],
        isNewUser: false,
        isAdmin: true,
      });
    }

    const isValidPassword = await bcrypt.compare(password, foundUser.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    const { expiresInSeconds } = await this.adminOtpService.sendChallenge(
      foundUser.id,
      foundUser.email
    );
    return {
      status: false,
      requiresOtp: true,
      expiresInSeconds,
      message: 'Enter the 6-digit code your super-admin received by email.',
    };
  }

  async adminResendOtp(input: AdminResendOtpInput) {
    const { email, password } = input;
    if (!this.adminEmails.includes(email)) {
      throw new UnauthorizedException('You are not authorized to access this resource');
    }

    const user = await this.usersRepository.findOne({
      where: { email, isAdmin: true },
    });
    if (!user) {
      throw new UnauthorizedException('You are not authorized to access this resource');
    }
    if (user.provider !== LoginProvider.EMAIL) {
      throw new UnauthorizedException('Use Google sign-in for this account');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    const { expiresInSeconds } = await this.adminOtpService.sendChallenge(user.id, user.email);
    return {
      status: true,
      expiresInSeconds,
      message: 'A new code was emailed to your super-admin.',
    };
  }

  async adminVerifyOtp(input: AdminVerifyOtpInput) {
    const { email, password, otp } = input;
    if (!this.adminEmails.includes(email)) {
      throw new UnauthorizedException('You are not authorized to access this resource');
    }

    const user = await this.usersRepository.findOne({
      where: { email, isAdmin: true },
    });
    if (!user) {
      throw new UnauthorizedException('You are not authorized to access this resource');
    }

    if (user.provider !== LoginProvider.EMAIL) {
      throw new UnauthorizedException('Use Google sign-in for this account');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    const ok = await this.adminOtpService.verifyAndConsume(user.id, otp);
    if (!ok) {
      throw new UnauthorizedException('Invalid or expired code');
    }

    const isNewUser = Date.now() - new Date(user.createdAt).getTime() < 15 * 60 * 1000;

    return this.buildAuthResponse({
      user,
      roles: [RoleCode.ADMIN],
      isNewUser,
      isAdmin: true,
    });
  }

  async changePassword(input: { userId: string; body: ChangePasswordInput }) {
    const {
      userId,
      body: { newPassword },
    } = input;
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await this.usersRepository.update(userId, { passwordHash: newPasswordHash });
    return { message: 'Password changed successfully' };
  }
}
