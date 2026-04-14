import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { LawyersController } from './lawyers.controller';
import { LawyersService } from './lawyers.service';

@Module({
  imports: [AuthModule],
  controllers: [LawyersController],
  providers: [LawyersService],
  exports: [LawyersService],
})
export class LawyersModule {}
