import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CaseChatSocketUser } from 'src/types';
import { CaseChatAuthService } from './case-chat-auth.service';
import { CaseChatService } from './case-chat.service';
import {
  ADMINS_NOTIFY_ROOM,
  CHAT_ERROR,
  CHAT_JOIN,
  CHAT_MESSAGE,
  CHAT_NOTIFY,
  CHAT_SEND,
  userNotifyRoom,
} from './case-chat.constants';
import { ChatJoinDto } from './dto/chat-join.dto';
import { ChatSendDto } from './dto/chat-send.dto';

const TOKEN_RECHECK_BUFFER_S = 60;

@WebSocketGateway({
  path: '/api/socket.io',
  cors: { origin: true, credentials: true },
})
export class CaseChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly caseChat: CaseChatService,
    private readonly auth: CaseChatAuthService
  ) {}

  private async authenticateClient(client: Socket): Promise<CaseChatSocketUser | null> {
    try {
      const user = await this.auth.verifySocket(client);
      client.data.user = user;
      return user;
    } catch {
      return null;
    }
  }

  async handleConnection(client: Socket) {
    const user = await this.authenticateClient(client);
    if (!user) {
      client.disconnect(true);
      return;
    }
    await client.join(userNotifyRoom(user.sub));
    if (user.isAdmin) await client.join(ADMINS_NOTIFY_ROOM);
  }

  /**
   * Returns the cached user, re-verifying the JWT when it expires within
   * TOKEN_RECHECK_BUFFER_S seconds. Disconnects and returns null on auth failure.
   */
  private async ensureUser(client: Socket): Promise<CaseChatSocketUser | null> {
    const cached = client.data.user as CaseChatSocketUser | undefined;
    if (cached) {
      const nowSec = Math.floor(Date.now() / 1000);
      if (!cached.exp || cached.exp > nowSec + TOKEN_RECHECK_BUFFER_S) return cached;
    }
    return this.authenticateClient(client);
  }

  @SubscribeMessage(CHAT_JOIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async join(@ConnectedSocket() client: Socket, @MessageBody() body: ChatJoinDto) {
    const user = await this.ensureUser(client);
    if (!user) return { ok: false, error: 'Unauthorized' };

    try {
      await this.caseChat.assertCaseParticipant(user, body.caseId);
      await client.join(this.caseChat.room(body.caseId));
      return { ok: true };
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Access denied';
      client.emit(CHAT_ERROR, { code: 'JOIN', error });
      return { ok: false, error };
    }
  }

  @SubscribeMessage(CHAT_SEND)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async send(@ConnectedSocket() client: Socket, @MessageBody() body: ChatSendDto) {
    const user = await this.ensureUser(client);
    if (!user) return { ok: false, error: 'Unauthorized' };

    try {
      const persisted = await this.caseChat.persistMessage(user, body);

      if (!persisted) {
        // Idempotent duplicate — already delivered on the first attempt.
        return { ok: true };
      }

      const { message } = persisted;
      const broadcastMsg = body.clientMessageId
        ? { ...message, clientMessageId: body.clientMessageId }
        : message;

      this.server.to(this.caseChat.room(body.caseId)).emit(CHAT_MESSAGE, broadcastMsg);

      const notifyPayload = {
        caseId: persisted.caseId,
        caseCode: persisted.caseCode,
        message: {
          id: message.id,
          senderRole: message.senderRole,
          content: message.content,
          timestamp: message.timestamp,
          messageType: message.messageType,
          assetUrl: message.assetUrl ?? undefined,
          assetName: message.assetName ?? undefined,
        },
      };

      const senderId = user.sub;
      const participantIds = [persisted.ownerUserId, persisted.lawyerUserId].filter(
        (uid): uid is string => Boolean(uid) && uid !== senderId
      );
      for (const uid of participantIds) {
        this.server.to(userNotifyRoom(uid)).emit(CHAT_NOTIFY, notifyPayload);
      }
      client.to(ADMINS_NOTIFY_ROOM).emit(CHAT_NOTIFY, notifyPayload);

      return { ok: true };
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Send failed';
      client.emit(CHAT_ERROR, { code: 'SEND', error });
      return { ok: false, error };
    }
  }
}

