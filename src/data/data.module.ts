import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import * as entities from './entities';
import * as repositories from './repositories';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const obj =
          configService.getOrThrow('DB_SSL_MODE') === 'require'
            ? { ssl: { rejectUnauthorized: false }, extra: { ssl: { rejectUnauthorized: false } } }
            : {};

        return {
          type: 'postgres',
          host: configService.getOrThrow('DB_HOST'),
          port: configService.getOrThrow<number>('DB_PORT'),
          username: configService.getOrThrow('DB_USERNAME'),
          password: configService.getOrThrow('DB_PASSWORD'),
          database: configService.getOrThrow('DB_DATABASE'),
          entities: [join(process.cwd(), 'dist/src/data/entities/*.entity.js')],
          migrations: [join(process.cwd(), 'dist/src/data/migrations/*.js')],
          migrationsRun: true,
          synchronize: false,
          logging: false,
          uuidExtension: 'pgcrypto',
          ...obj,
        };
      },
    }),
    TypeOrmModule.forFeature(Object.values(entities)),
  ],
  providers: [...Object.values(repositories)],
  exports: [...Object.values(repositories)],
})
export class DataModule {}
