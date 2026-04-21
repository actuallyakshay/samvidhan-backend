import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { UsersRepository } from 'src/data/repositories';
import { PushPayload } from 'src/types';
import { In } from 'typeorm';

@Injectable()
export class PushNotificationService implements OnModuleInit {
  private readonly logger = new Logger(PushNotificationService.name);
  private messaging: admin.messaging.Messaging | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository
  ) {}

  onModuleInit() {
    const serviceAccount = JSON.parse(
      this.configService.get('FIREBASE_SERVICE_ACCOUNT_JSON') as string
    );

    const app =
      admin.apps.length > 0
        ? admin.app()
        : admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

    this.messaging = app.messaging();
    this.logger.log('Firebase Admin initialized for push notifications');
  }

  async sendPush(input: { fcmToken: string; payload: PushPayload }): Promise<string | null> {
    const { fcmToken, payload } = input;
    if (!this.messaging) return null;

    const { title, body, clickActionUrl, data = {} } = payload;

    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: { title, body },
      webpush: {
        notification: {
          title,
          body,
          ...(clickActionUrl && { click_action: clickActionUrl }),
        },
        ...(clickActionUrl && { fcmOptions: { link: clickActionUrl } }),
      },
      data,
    };

    try {
      const messageId = await this.messaging.send(message);
      return messageId;
    } catch (err) {
      this.logger.error(`Failed to send push to token ${fcmToken.slice(0, 10)}…`, err?.message);
      return null;
    }
  }

  async sendToUserId(userId: string, payload: PushPayload): Promise<string | null> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: { id: true, fcmToken: true },
    });

    if (!user?.fcmToken) {
      this.logger.debug(`No FCM token for user ${userId}`);
      return null;
    }

    return this.sendPush({ fcmToken: user.fcmToken, payload });
  }

  async sendToUserIds(
    userIds: string[],
    payload: PushPayload
  ): Promise<{ sent: number; failed: number }> {
    if (!userIds.length) return { sent: 0, failed: 0 };

    const users = await this.usersRepository.find({
      where: { id: In(userIds) },
      select: { id: true, fcmToken: true },
    });

    const tokensWithUsers = users.filter((u) => u.fcmToken);

    const results = await Promise.all(
      tokensWithUsers.map((u) => this.sendPush({ fcmToken: u.fcmToken!, payload }))
    );

    const sent = results.filter(Boolean).length;
    return { sent, failed: tokensWithUsers.length - sent };
  }
}
