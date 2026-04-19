import { plainToClass } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
  ValidateIf,
} from 'class-validator';

enum EnvironmentType {
  DEV = 'development',
  PROD = 'production',
}

class EnvironmentVariables {
  @IsNotEmpty()
  @IsEnum(EnvironmentType)
  NODE_ENV: EnvironmentType;

  @IsNumber()
  PORT?: number;

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsNumber()
  @IsNotEmpty()
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_DATABASE: string;

  @IsOptional()
  DB_SSL_MODE?: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_EXPIRY?: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRY?: string;

  @IsString()
  @IsNotEmpty()
  STORAGE_BUCKET: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  @IsOptional()
  GOOGLE_SERVICE_ACCOUNT_KEY_JSON?: string;

  /** Firebase service account JSON (same project as the client FCM SDK) for server-side FCM sends. */
  @IsString()
  @IsOptional()
  FIREBASE_SERVICE_ACCOUNT_JSON?: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_REFRESH_TOKEN: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_SECRET: string;

  /** Comma-separated frontend origins, e.g. https://app.example.com,https://www.example.com */
  @IsString()
  @IsOptional()
  CORS_ORIGINS?: string;

  /** lax | strict | none — use none + HTTPS when API and SPA are on different sites */
  @IsString()
  @IsOptional()
  COOKIE_SAME_SITE?: string;

  /** Set to false for local HTTP dev if browsers reject Secure cookies */
  @IsString()
  @IsOptional()
  COOKIE_SECURE?: string;

  @IsString()
  @IsNotEmpty()
  ADMIN_EMAILS: string;

  /** Comma-separated inboxes that receive the admin login OTP. If unset, all ADMIN_EMAILS except the signing-in admin receive it. */
  @IsString()
  @IsOptional()
  SUPER_ADMIN_EMAILS?: string;

  @IsString()
  @IsNotEmpty()
  MAIL_HOST: string;

  @IsNumber()
  @IsNotEmpty()
  MAIL_PORT: number;

  @IsString()
  @IsNotEmpty()
  MAIL_USER: string;

  @IsString()
  @IsNotEmpty()
  MAIL_PASS: string;

  @IsString()
  @IsNotEmpty()
  MAIL_FROM: string;

  /** Set to true when using implicit TLS (typical for port 465). Omit or false for STARTTLS (typical for 587). */
  @IsString()
  @IsOptional()
  MAIL_SECURE?: string;

  /** Nodemailer connection timeout in ms (default 60000). Lower on Railway to fail fast if SMTP is unreachable. */
  @IsNumber()
  @IsOptional()
  MAIL_CONNECTION_TIMEOUT_MS?: number;

  /** If set, Razorpay API + webhooks are enabled; key secret and webhook secret are then required. */
  @IsString()
  @IsOptional()
  RAZORPAY_KEY_ID?: string;

  @ValidateIf((o) => !!o.RAZORPAY_KEY_ID?.trim())
  @IsString()
  @IsNotEmpty()
  RAZORPAY_KEY_SECRET?: string;

  /** Webhook signing secret from the Razorpay Dashboard (not the API key secret). */
  @ValidateIf((o) => !!o.RAZORPAY_KEY_ID?.trim())
  @IsString()
  @IsNotEmpty()
  RAZORPAY_WEBHOOK_SECRET?: string;
}

export function validateConfig(configuration: Record<string, unknown>) {
  const finalConfig = plainToClass(EnvironmentVariables, configuration, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(finalConfig, { skipMissingProperties: true });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return finalConfig;
}
