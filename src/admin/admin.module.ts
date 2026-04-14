import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CasesService } from 'src/cases/cases.service';
import { LawyersService } from 'src/lawyers/lawyers.service';
import { GoogleMeetService } from 'src/google-meet/google-meet.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminService, CasesService, LawyersService, GoogleMeetService],
})
export class AdminModule {}
