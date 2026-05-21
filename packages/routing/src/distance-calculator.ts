import { Client, TravelMode, UnitSystem } from '@googlemaps/google-maps-services-js';
import { DistanceCache } from './distance-cache';

export interface Location {
  lat: number;
  lng: number;
}

export interface DistanceMatrixResult {
  distances: number[][]; // in meters
  durations: number[][]; // in seconds
}

export class DistanceCalculator {
  private client: Client;
  private apiKey: string;
  private cache: DistanceCache;
  private requestQueue: Array<() => Promise<any>> = [];
  private processing = false;
  private readonly MAX_ELEMENTS_PER_REQUEST = 100; // Google Maps limit
  private readonly REQUEST_DELAY = 200; // ms between requests

  constructor(apiKey: string) {
    this.client = new Client({});
    this.apiKey = apiKey;
    this.cache = new DistanceCache();
  }

  async calculateDistanceMatrix(
    origins: Location[],
    destinations: Location[],
    mode: TravelMode = TravelMode.driving
  ): Promise<DistanceMatrixResult> {
    const originStrs = origins.map(loc => `${loc.lat},${loc.lng}`);
    const destStrs = destinations.map(loc => `${loc.lat},${loc.lng}`);

    // FIX: Check cache first
    const cached = this.cache.get(originStrs, destStrs);
    if (cached) {
      return { distances: cached.distances, durations: cached.durations };
    }

    // FIX: Validate request size
    const totalElements = origins.length * destinations.length;
    if (totalElements > this.MAX_ELEMENTS_PER_REQUEST) {
      return this.calculateDistanceMatrixBatched(origins, destinations, mode);
    }

    try {
      // FIX: Add to queue for rate limiting
      const result = await this.queueRequest(async () => {
        const response = await this.client.distancematrix({
          params: {
            origins: originStrs,
            destinations: destStrs,
            mode,
            units: UnitSystem.metric,
            key: this.apiKey,
          },
        });

        const distances: number[][] = [];
        const durations: number[][] = [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        response.data.rows.forEach((row: any) => {
          const distRow: number[] = [];
          const durRow: number[] = [];

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          row.elements.forEach((element: any) => {
            if (element.status === 'OK') {
              distRow.push(element.distance.value);
              durRow.push(element.duration.value);
            } else {
              distRow.push(Infinity);
              durRow.push(Infinity);
            }
          });

          distances.push(distRow);
          durations.push(durRow);
        });

        return { distances, durations };
      });

      // FIX: Cache the result
      this.cache.set(originStrs, destStrs, result.distances, result.durations);

      return result;
    } catch (error) {
      console.error('Distance Matrix API error:', error);
      throw new Error('Failed to calculate distance matrix');
    }
  }

  // FIX: Batch large requests to stay within API limits
  private async calculateDistanceMatrixBatched(
    origins: Location[],
    destinations: Location[],
    mode: TravelMode
  ): Promise<DistanceMatrixResult> {
    const batchSize = Math.floor(Math.sqrt(this.MAX_ELEMENTS_PER_REQUEST));
    const distances: number[][] = [];
    const durations: number[][] = [];

    for (let i = 0; i < origins.length; i += batchSize) {
      const originBatch = origins.slice(i, i + batchSize);
      const distRow: number[][] = [];
      const durRow: number[][] = [];

      for (let j = 0; j < destinations.length; j += batchSize) {
        const destBatch = destinations.slice(j, j + batchSize);
        const result = await this.calculateDistanceMatrix(originBatch, destBatch, mode);
        
        result.distances.forEach((row, idx) => {
          if (!distRow[idx]) distRow[idx] = [];
          if (!durRow[idx]) durRow[idx] = [];
          distRow[idx].push(...row);
          durRow[idx].push(...result.durations[idx]);
        });
      }

      distances.push(...distRow);
      durations.push(...durRow);
    }

    return { distances, durations };
  }

  // FIX: Queue requests to prevent rate limiting
  private async queueRequest<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.requestQueue.length === 0) return;

    this.processing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        await request();
        // FIX: Delay between requests to respect rate limits
        if (this.requestQueue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, this.REQUEST_DELAY));
        }
      }
    }

    this.processing = false;
  }

  async getDirections(
    origin: Location,
    destination: Location,
    waypoints?: Location[]
  ) {
    try {
      const response = await this.client.directions({
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          waypoints: waypoints?.map(wp => `${wp.lat},${wp.lng}`),
          mode: TravelMode.driving,
          key: this.apiKey,
        },
      });

      return response.data.routes[0];
    } catch (error) {
      console.error('Directions API error:', error);
      throw new Error('Failed to get directions');
    }
  }
}
