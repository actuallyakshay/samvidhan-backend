import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CaseChatAuthService } from './case-chat-auth.service';
import { CaseChatGateway } from './case-chat.gateway';
import { CaseChatService } from './case-chat.service';

@Module({
  imports: [AuthModule],
  providers: [CaseChatGateway, CaseChatService, CaseChatAuthService],
})
export class CaseChatModule {}
