import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

function parseCorsOrigins(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function bootstrap() {
  // Prefer A over AAAA on hosts where IPv6 egress is broken (common on Railway → Gmail SMTP).

  const logger = new Logger('Samvidhan');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  app.useWebSocketAdapter(new IoAdapter(app));

  const configService = app.get(ConfigService);

  app.use(cookieParser());

  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    'http://localhost',
    'http://localhost:8081',
    'https://samvidhan-tau.vercel.app',
  ];
  const fromEnv = parseCorsOrigins(configService.get<string>('CORS_ORIGINS'));
  const allowedOrigins = [...new Set([...defaultOrigins, ...fromEnv])];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-active-role', 'x-refresh-token'],
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Samvidhan API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = configService.get<number>('PORT') || 7090;
  await app.listen(port);

  logger.log(`Listening on port: ${port}`);
  logger.log(`Swagger docs: http://localhost:${port}/docs`);
}
bootstrap();
