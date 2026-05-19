import axios from 'axios';

export interface LineConfig {
  channelAccessToken: string;
}

export interface LineMessage {
  to: string; // User ID or Group ID
  messages: LineMessageObject[];
}

export interface LineMessageObject {
  type: 'text' | 'image' | 'location';
  text?: string;
  originalContentUrl?: string;
  previewImageUrl?: string;
  title?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export class LineNotifier {
  private channelAccessToken: string;
  private baseUrl = 'https://api.line.me/v2/bot';

  constructor(config: LineConfig) {
    this.channelAccessToken = config.channelAccessToken;
  }

  async sendMessage(message: LineMessage): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/message/push`,
        message,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.channelAccessToken}`,
          },
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('LINE send message error:', error);
      return false;
    }
  }

  async broadcastMessage(messages: LineMessageObject[]): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/message/broadcast`,
        { messages },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.channelAccessToken}`,
          },
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('LINE broadcast error:', error);
      return false;
    }
  }

  createTextMessage(text: string): LineMessageObject {
    return {
      type: 'text',
      text,
    };
  }

  createImageMessage(imageUrl: string): LineMessageObject {
    return {
      type: 'image',
      originalContentUrl: imageUrl,
      previewImageUrl: imageUrl,
    };
  }

  createLocationMessage(
    title: string,
    address: string,
    latitude: number,
    longitude: number
  ): LineMessageObject {
    return {
      type: 'location',
      title,
      address,
      latitude,
      longitude,
    };
  }

  formatPickupNotification(passengerName: string, eta: string): string {
    return `🚌 รถกำลังมาถึง\n\n` +
           `ผู้โดยสาร: ${passengerName}\n` +
           `เวลาถึงโดยประมาณ: ${eta}\n\n` +
           `กรุณาเตรียมตัวที่จุดรับ`;
  }

  formatDropoffNotification(passengerName: string): string {
    return `✅ ส่งผู้โดยสารเรียบร้อย\n\n` +
           `ผู้โดยสาร: ${passengerName}\n` +
           `เวลา: ${new Date().toLocaleTimeString('th-TH')}\n\n` +
           `ขอบคุณที่ใช้บริการ`;
  }

  formatDelayNotification(passengerName: string, delayMinutes: number): string {
    return `⏰ แจ้งความล่าช้า\n\n` +
           `ผู้โดยสาร: ${passengerName}\n` +
           `ล่าช้า: ${delayMinutes} นาที\n\n` +
           `ขออภัยในความไม่สะดวก`;
  }
}
