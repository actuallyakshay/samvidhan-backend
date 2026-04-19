import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CasesModule } from 'src/cases/cases.module';
import { CaseChatAuthService } from './case-chat-auth.service';
import { CaseChatGateway } from './case-chat.gateway';
import { CaseChatService } from './case-chat.service';

@Module({
  imports: [AuthModule, CasesModule],
  providers: [CaseChatGateway, CaseChatService, CaseChatAuthService],
})
export class CaseChatModule {}
