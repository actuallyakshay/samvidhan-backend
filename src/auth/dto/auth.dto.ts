import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { RoleCode } from 'src/enums';

export class EmailAuthInput {
  @ApiProperty({ example: 'akshay@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'StrongP@ss1', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: RoleCode, example: RoleCode.USER })
  @IsEnum(RoleCode)
  role: RoleCode;

  @ApiPropertyOptional({ example: 'fcm-token-string' })
  @IsString()
  @IsOptional()
  fcmToken?: string;
}

export class GoogleAuthInput {
  @ApiProperty({ description: 'Google ID token from frontend' })
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @ApiProperty({ enum: RoleCode, example: RoleCode.USER })
  @IsEnum(RoleCode)
  role: RoleCode;

  @ApiPropertyOptional({ example: 'fcm-token-string' })
  @IsString()
  @IsOptional()
  fcmToken?: string;
}

export class RefreshTokenInput {
  @ApiPropertyOptional({
    description:
      'Optional when using HttpOnly cookie auth; otherwise the refresh token from login.',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class AdminLoginInput {
  @ApiProperty({ description: 'Email address of the admin' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ description: 'Password of the admin' })
  @IsString()
  @IsOptional()
  password?: string;
}

export class AdminVerifyOtpInput {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Same password as step 1' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: '6-digit code from super-admin email' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'OTP must be exactly 6 digits' })
  otp: string;
}

export class AdminResendOtpInput {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Same password as initial admin login' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ChangePasswordInput {
  @ApiProperty({ description: 'New password of the user' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
