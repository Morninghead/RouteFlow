import axios from 'axios';

export interface TelegramConfig {
  botToken: string;
}

export interface TelegramMessage {
  chatId: string;
  text: string;
  parseMode?: 'Markdown' | 'HTML';
  photo?: string;
}

export class TelegramNotifier {
  private botToken: string;
  private baseUrl: string;

  constructor(config: TelegramConfig) {
    this.botToken = config.botToken;
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  async sendMessage(message: TelegramMessage): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseUrl}/sendMessage`, {
        chat_id: message.chatId,
        text: message.text,
        parse_mode: message.parseMode || 'Markdown',
      });

      return response.data.ok;
    } catch (error) {
      console.error('Telegram send message error:', error);
      return false;
    }
  }

  async sendPhoto(message: TelegramMessage): Promise<boolean> {
    if (!message.photo) {
      throw new Error('Photo URL is required');
    }

    try {
      const response = await axios.post(`${this.baseUrl}/sendPhoto`, {
        chat_id: message.chatId,
        photo: message.photo,
        caption: message.text,
        parse_mode: message.parseMode || 'Markdown',
      });

      return response.data.ok;
    } catch (error) {
      console.error('Telegram send photo error:', error);
      return false;
    }
  }

  async sendLocation(
    chatId: string,
    latitude: number,
    longitude: number,
    title?: string
  ): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseUrl}/sendLocation`, {
        chat_id: chatId,
        latitude,
        longitude,
      });

      return response.data.ok;
    } catch (error) {
      console.error('Telegram send location error:', error);
      return false;
    }
  }

  formatPickupNotification(passengerName: string, eta: string): string {
    return `🚌 *Bus Approaching*\n\n` +
           `Passenger: ${passengerName}\n` +
           `Estimated arrival: ${eta}\n\n` +
           `Please be ready at the pickup point.`;
  }

  formatDropoffNotification(passengerName: string, photoUrl?: string): string {
    return `✅ *Passenger Dropped Off*\n\n` +
           `Passenger: ${passengerName}\n` +
           `Time: ${new Date().toLocaleTimeString('th-TH')}\n\n` +
           (photoUrl ? `Photo proof attached.` : '');
  }

  formatDelayNotification(passengerName: string, delayMinutes: number): string {
    return `⏰ *Delay Notice*\n\n` +
           `Passenger: ${passengerName}\n` +
           `Delay: ${delayMinutes} minutes\n\n` +
           `We apologize for the inconvenience.`;
  }
}
