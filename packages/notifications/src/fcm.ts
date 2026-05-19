import * as admin from 'firebase-admin';

export interface FCMConfig {
  serviceAccount: admin.ServiceAccount;
}

export interface FCMMessage {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export class FCMNotifier {
  private messaging: admin.messaging.Messaging;

  constructor(config: FCMConfig) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(config.serviceAccount),
      });
    }
    this.messaging = admin.messaging();
  }

  async sendNotification(message: FCMMessage): Promise<boolean> {
    try {
      const payload: admin.messaging.Message = {
        token: message.token,
        notification: {
          title: message.title,
          body: message.body,
          imageUrl: message.imageUrl,
        },
        data: message.data,
        webpush: {
          notification: {
            title: message.title,
            body: message.body,
            icon: '/icon-192.png',
            badge: '/badge-72.png',
          },
        },
      };

      await this.messaging.send(payload);
      return true;
    } catch (error) {
      console.error('FCM send notification error:', error);
      return false;
    }
  }

  async sendMulticast(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<number> {
    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title,
          body,
        },
        data,
      };

      const response = await this.messaging.sendEachForMulticast(message);
      return response.successCount;
    } catch (error) {
      console.error('FCM multicast error:', error);
      return 0;
    }
  }

  async subscribeToTopic(tokens: string[], topic: string): Promise<boolean> {
    try {
      await this.messaging.subscribeToTopic(tokens, topic);
      return true;
    } catch (error) {
      console.error('FCM subscribe error:', error);
      return false;
    }
  }

  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<boolean> {
    try {
      await this.messaging.unsubscribeFromTopic(tokens, topic);
      return true;
    } catch (error) {
      console.error('FCM unsubscribe error:', error);
      return false;
    }
  }
}
