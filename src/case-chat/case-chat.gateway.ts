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
import { CaseChatSocketUser } from 'src/types';
import { ChatJoinDto } from './dto/chat-join.dto';
import { ChatSendDto } from './dto/chat-send.dto';

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

  async handleConnection(client: Socket) {
    try {
      const user = await this.auth.verifySocket(client);
      client.data.user = user;
      await client.join(userNotifyRoom(user.sub));
      if (user.isAdmin) await client.join(ADMINS_NOTIFY_ROOM);
    } catch {
      client.disconnect(true);
    }
  }

  /** Join/send can run before async `handleConnection` finishes; verify here too. */
  private async ensureUser(client: Socket): Promise<CaseChatSocketUser | null> {
    const existing = client.data.user as CaseChatSocketUser | undefined;
    if (existing) return existing;
    try {
      const user = await this.auth.verifySocket(client);
      client.data.user = user;
      return user;
    } catch {
      return null;
    }
  }

  @SubscribeMessage(CHAT_JOIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async join(@ConnectedSocket() client: Socket, @MessageBody() body: ChatJoinDto) {
    const user = await this.ensureUser(client);
    if (!user) return { ok: false };
    try {
      await this.caseChat.joinRoom(user, body.caseId);
      await client.join(this.caseChat.room(body.caseId));
      return { ok: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Join failed';
      client.emit(CHAT_ERROR, { code: 'JOIN', message });
      return { ok: false };
    }
  }

  @SubscribeMessage(CHAT_SEND)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async send(@ConnectedSocket() client: Socket, @MessageBody() body: ChatSendDto) {
    const user = await this.ensureUser(client);
    if (!user) return { ok: false };
    try {
      const persisted = await this.caseChat.persistAndBroadcastPayload(user, body);
      const { message } = persisted;
      const withAck = body.clientMessageId
        ? { ...message, clientMessageId: body.clientMessageId }
        : message;
      this.server.to(this.caseChat.room(body.caseId)).emit(CHAT_MESSAGE, withAck);

      const notifyPayload = {
        caseId: persisted.caseId,
        caseCode: persisted.caseCode,
        message: {
          id: message.id,
          senderId: message.senderId,
          senderName: message.senderName,
          senderRole: message.senderRole,
          content: message.content,
          timestamp: message.timestamp,
        },
      };
      const senderId = user.sub;
      if (persisted.ownerUserId !== senderId) {
        this.server.to(userNotifyRoom(persisted.ownerUserId)).emit(CHAT_NOTIFY, notifyPayload);
      }
      if (persisted.lawyerUserId && persisted.lawyerUserId !== senderId) {
        this.server.to(userNotifyRoom(persisted.lawyerUserId)).emit(CHAT_NOTIFY, notifyPayload);
      }
      client.to(ADMINS_NOTIFY_ROOM).emit(CHAT_NOTIFY, notifyPayload);

      return { ok: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Send failed';
      client.emit(CHAT_ERROR, { code: 'SEND', message });
      return { ok: false };
    }
  }
}
