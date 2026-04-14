import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { GcpStorageService } from 'src/gcp-service/gcp.service';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';

@Module({
  imports: [AuthModule],
  controllers: [CasesController],
  providers: [CasesService, GcpStorageService],
  exports: [CasesService],
})
export class CasesModule {}
