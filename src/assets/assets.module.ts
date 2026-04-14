import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { GcpStorageService } from 'src/gcp-service/gcp.service';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';

@Module({
  imports: [AuthModule],
  providers: [AssetsService, GcpStorageService],
  controllers: [AssetsController],
  exports: [AssetsService],
})
export class AssetsModule {}
