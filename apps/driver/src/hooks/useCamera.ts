import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface Photo {
  dataUrl: string;
  timestamp: number;
}

export function useCamera() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const takePhoto = async (): Promise<Photo | null> => {
    setLoading(true);
    setError(null);

    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (!image.dataUrl) {
        throw new Error('Failed to capture photo');
      }

      setLoading(false);
      return {
        dataUrl: image.dataUrl,
        timestamp: Date.now(),
      };
    } catch (err: any) {
      setError(err.message || 'Failed to take photo');
      setLoading(false);
      return null;
    }
  };

  return { takePhoto, loading, error };
}
