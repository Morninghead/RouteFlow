import { TelegramNotifier, TelegramConfig } from './telegram';
import { LineNotifier, LineConfig } from './line';
import { FCMNotifier, FCMConfig } from './fcm';

export interface NotificationConfig {
  telegram?: TelegramConfig;
  line?: LineConfig;
  fcm?: FCMConfig;
}

export interface NotificationPayload {
  type: 'pickup' | 'dropoff' | 'delay' | 'custom';
  passengerName: string;
  message?: string;
  eta?: string;
  delayMinutes?: number;
  photoUrl?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

export class NotificationService {
  private telegram?: TelegramNotifier;
  private line?: LineNotifier;
  private fcm?: FCMNotifier;

  constructor(config: NotificationConfig) {
    if (config.telegram) {
      this.telegram = new TelegramNotifier(config.telegram);
    }
    if (config.line) {
      this.line = new LineNotifier(config.line);
    }
    if (config.fcm) {
      this.fcm = new FCMNotifier(config.fcm);
    }
  }

  async sendNotification(
    channels: Array<'telegram' | 'line' | 'fcm'>,
    recipients: {
      telegram?: string;
      line?: string;
      fcm?: string;
    },
    payload: NotificationPayload
  ): Promise<{ telegram?: boolean; line?: boolean; fcm?: boolean; errors?: string[] }> {
    const results: any = {};
    const errors: string[] = [];
    const promises: Promise<void>[] = [];

    // FIX: Send via Telegram with error handling
    if (channels.includes('telegram') && this.telegram && recipients.telegram) {
      promises.push(
        (async () => {
          try {
            const message = this.formatMessage(payload, 'telegram');
            
            if (payload.photoUrl) {
              results.telegram = await this.telegram!.sendPhoto({
                chatId: recipients.telegram!,
                text: message,
                photo: payload.photoUrl,
              });
            } else {
              results.telegram = await this.telegram!.sendMessage({
                chatId: recipients.telegram!,
                text: message,
              });
            }

            if (payload.location) {
              await this.telegram!.sendLocation(
                recipients.telegram!,
                payload.location.lat,
                payload.location.lng
              );
            }
          } catch (error: any) {
            errors.push(`Telegram: ${error.message || 'Unknown error'}`);
            results.telegram = false;
          }
        })()
      );
    }

    // FIX: Send via LINE with error handling
    if (channels.includes('line') && this.line && recipients.line) {
      promises.push(
        (async () => {
          try {
            const message = this.formatMessage(payload, 'line');
            const messages = [this.line!.createTextMessage(message)];

            if (payload.photoUrl) {
              messages.push(this.line!.createImageMessage(payload.photoUrl));
            }

            if (payload.location) {
              messages.push(
                this.line!.createLocationMessage(
                  'Location',
                  payload.location.address || 'Current location',
                  payload.location.lat,
                  payload.location.lng
                )
              );
            }

            results.line = await this.line!.sendMessage({
              to: recipients.line!,
              messages,
            });
          } catch (error: any) {
            errors.push(`LINE: ${error.message || 'Unknown error'}`);
            results.line = false;
          }
        })()
      );
    }

    // FIX: Send via FCM with error handling
    if (channels.includes('fcm') && this.fcm && recipients.fcm) {
      promises.push(
        (async () => {
          try {
            const { title, body } = this.formatFCMMessage(payload);
            
            results.fcm = await this.fcm!.sendNotification({
              token: recipients.fcm!,
              title,
              body,
              imageUrl: payload.photoUrl,
              data: {
                type: payload.type,
                passengerName: payload.passengerName,
              },
            });
          } catch (error: any) {
            errors.push(`FCM: ${error.message || 'Unknown error'}`);
            results.fcm = false;
          }
        })()
      );
    }

    // FIX: Wait for all notifications to complete (no cascade failure)
    await Promise.allSettled(promises);

    return { ...results, errors: errors.length > 0 ? errors : undefined };
  }

  private formatMessage(payload: NotificationPayload, platform: 'telegram' | 'line'): string {
    const notifier = platform === 'telegram' ? this.telegram : this.line;
    if (!notifier) return '';

    switch (payload.type) {
      case 'pickup':
        return notifier.formatPickupNotification(
          payload.passengerName,
          payload.eta || 'Soon'
        );
      case 'dropoff':
        return notifier.formatDropoffNotification(payload.passengerName);
      case 'delay':
        return notifier.formatDelayNotification(
          payload.passengerName,
          payload.delayMinutes || 0
        );
      case 'custom':
        return payload.message || '';
      default:
        return '';
    }
  }

  private formatFCMMessage(payload: NotificationPayload): { title: string; body: string } {
    switch (payload.type) {
      case 'pickup':
        return {
          title: '🚌 Bus Approaching',
          body: `${payload.passengerName} - ETA: ${payload.eta || 'Soon'}`,
        };
      case 'dropoff':
        return {
          title: '✅ Passenger Dropped Off',
          body: `${payload.passengerName} has been safely dropped off`,
        };
      case 'delay':
        return {
          title: '⏰ Delay Notice',
          body: `${payload.passengerName} - Delayed by ${payload.delayMinutes} minutes`,
        };
      case 'custom':
        return {
          title: 'Notification',
          body: payload.message || '',
        };
      default:
        return { title: '', body: '' };
    }
  }
}
