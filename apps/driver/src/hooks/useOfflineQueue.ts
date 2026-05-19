import { useState, useEffect, useCallback, useRef } from 'react';
import { Preferences } from '@capacitor/preferences';
import { Network } from '@capacitor/network';

interface QueueItem {
  id: string;
  type: 'photo' | 'location' | 'attendance';
  data: any;
  timestamp: number;
  retries: number;
}

const QUEUE_KEY = 'offline_queue';
const MAX_RETRIES = 3;

export function useOfflineQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [processing, setProcessing] = useState(false);
  const processingRef = useRef(false);

  // Load queue from storage
  useEffect(() => {
    loadQueue();
    checkNetworkStatus();

    const networkListener = Network.addListener('networkStatusChange', (status) => {
      setIsOnline(status.connected);
    });

    return () => {
      networkListener.remove();
    };
  }, []);

  // Process queue when online (using ref to prevent race conditions)
  useEffect(() => {
    if (isOnline && queue.length > 0 && !processing) {
      // Use setTimeout to debounce and prevent race conditions
      const timeoutId = setTimeout(() => {
        processQueue();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isOnline, queue.length, processing]);

  const loadQueue = async () => {
    try {
      const { value } = await Preferences.get({ key: QUEUE_KEY });
      if (value) {
        setQueue(JSON.parse(value));
      }
    } catch (err) {
      console.error('Failed to load queue:', err);
    }
  };

  const saveQueue = async (items: QueueItem[]) => {
    try {
      await Preferences.set({
        key: QUEUE_KEY,
        value: JSON.stringify(items),
      });
      setQueue(items);
    } catch (err) {
      console.error('Failed to save queue:', err);
    }
  };

  const checkNetworkStatus = async () => {
    const status = await Network.getStatus();
    setIsOnline(status.connected);
  };

  const addToQueue = useCallback(
    async (type: QueueItem['type'], data: any) => {
      const item: QueueItem = {
        id: crypto.randomUUID(),
        type,
        data,
        timestamp: Date.now(),
        retries: 0,
      };

      // FIX: Load current queue from storage to avoid race conditions
      const { value } = await Preferences.get({ key: QUEUE_KEY });
      const currentQueue = value ? JSON.parse(value) : [];
      const newQueue = [...currentQueue, item];
      
      // FIX: Await saveQueue before proceeding
      await saveQueue(newQueue);

      // Try to process immediately if online
      if (isOnline && !processingRef.current) {
        processQueue();
      }
    },
    [isOnline]
  );

  const processQueue = async () => {
    // FIX: Use ref to prevent race conditions
    if (processingRef.current) return;

    processingRef.current = true;
    setProcessing(true);

    // FIX: Load latest queue from storage
    const { value } = await Preferences.get({ key: QUEUE_KEY });
    const updatedQueue = value ? JSON.parse(value) : [];
    
    if (updatedQueue.length === 0) {
      processingRef.current = false;
      setProcessing(false);
      return;
    }

    const itemsToRemove: string[] = [];

    for (const item of updatedQueue) {
      try {
        // Simulate API call - replace with actual API calls
        await uploadItem(item);
        itemsToRemove.push(item.id);
      } catch (err) {
        item.retries += 1;
        if (item.retries >= MAX_RETRIES) {
          console.error('Max retries reached for item:', item.id);
          itemsToRemove.push(item.id);
        }
      }
    }

    const remainingQueue = updatedQueue.filter(
      (item) => !itemsToRemove.includes(item.id)
    );

    await saveQueue(remainingQueue);
    processingRef.current = false;
    setProcessing(false);
  };

  const uploadItem = async (item: QueueItem): Promise<void> => {
    // Replace with actual API calls
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.2) {
          resolve();
        } else {
          reject(new Error('Upload failed'));
        }
      }, 1000);
    });
  };

  const clearQueue = async () => {
    await saveQueue([]);
  };

  return {
    queue,
    isOnline,
    processing,
    addToQueue,
    clearQueue,
  };
}
