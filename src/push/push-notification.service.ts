import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { UsersRepository } from 'src/data/repositories';

export type PushSendResult =
  | { sent: true; messageId: string }
  | {
      sent: false;
      reason: 'disabled' | 'no_token' | 'empty_payload' | 'send_failed';
      detail?: string;
    };

/** Payload for FCM: works for Android, iOS, and Web (Firebase Messaging in the browser / supported WebViews). */
export type PushMessageInput = {
  title?: string;
  body?: string;
  data?: Record<string, string>;
  /** For web: opens when the user clicks the notification (FCM `webpush.fcmOptions.link`). */
  clickActionUrl?: string;
};

@Injectable()
export class PushNotificationService implements OnModuleInit {
  private readonly logger = new Logger(PushNotificationService.name);
  private messaging: admin.messaging.Messaging | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly usersRepository: UsersRepository
  ) {}

  onModuleInit() {
    try {
      const cred = JSON.parse(
        this.config.getOrThrow('FIREBASE_SERVICE_ACCOUNT_JSON')
      ) as admin.ServiceAccount;
      if (!admin.apps.length) {
        admin.initializeApp({ credential: admin.credential.cert(cred) });
      }
      this.messaging = admin.messaging();
      this.logger.log('Firebase Admin initialized for FCM');
    } catch (e) {
      this.logger.error('Failed to initialize Firebase Admin for FCM', e);
    }
  }

  isEnabled(): boolean {
    return this.messaging !== null;
  }

  async sendToToken(token: string, message: PushMessageInput): Promise<PushSendResult> {
    if (!this.messaging) {
      return { sent: false, reason: 'disabled' };
    }
    const hasNotification = Boolean(message.title?.trim() || message.body?.trim());
    const hasData = Boolean(message.data && Object.keys(message.data).length);
    if (!hasNotification && !hasData) {
      return { sent: false, reason: 'empty_payload' };
    }

    /**
     * Web (FCM JS): avoid a root-level `notification` object.
     * The Firebase SW runs `notification && showNotification(...)` before `setBackgroundMessageHandler`;
     * if that default step fails, the background handler may never run — which matches “works on the
     * app tab, nothing when another tab is focused” (all app tabs hidden → SW path only).
     * Data-only + `showNotification` in our SW / `onMessage` keeps web reliable; Android/iOS still get
     * banners via `android` / `apns` below.
     */
    const data: Record<string, string> = {};
    if (message.data) {
      for (const [k, v] of Object.entries(message.data)) {
        if (v != null && v !== '') data[k] = String(v);
      }
    }
    if (message.title?.trim()) data.title = message.title.trim();
    if (message.body?.trim()) data.body = message.body.trim();
    const click = message.clickActionUrl?.trim();
    if (click) data.url = click;

    const payload: admin.messaging.Message = {
      token,
      data,
      ...(click
        ? {
            webpush: {
              headers: { Urgency: 'high' },
              fcmOptions: { link: click },
            },
          }
        : { webpush: { headers: { Urgency: 'high' } } }),
    };

    if (hasNotification) {
      payload.android = {
        priority: 'high',
        notification: {
          ...(message.title?.trim() ? { title: message.title.trim() } : {}),
          ...(message.body?.trim() ? { body: message.body.trim() } : {}),
        },
      };
      payload.apns = {
        payload: {
          aps: {
            alert: {
              ...(message.title?.trim() ? { title: message.title.trim() } : {}),
              ...(message.body?.trim() ? { body: message.body.trim() } : {}),
            },
          },
        },
      };
    }

    try {
      const messageId = await this.messaging.send(payload);
      return { sent: true, messageId };
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      this.logger.warn(`FCM send failed: ${detail}`);
      return { sent: false, reason: 'send_failed', detail };
    }
  }

  async sendToUserId(userId: string, message: PushMessageInput): Promise<PushSendResult> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: { fcmToken: true },
    });
    if (!user?.fcmToken?.trim()) {
      return { sent: false, reason: 'no_token' };
    }
    return this.sendToToken(user.fcmToken.trim(), message);
  }
}
