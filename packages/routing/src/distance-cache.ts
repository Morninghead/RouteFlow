// Distance calculation cache to prevent redundant API calls

export interface CacheEntry {
  distances: number[][];
  durations: number[][];
  timestamp: number;
}

export class DistanceCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_SIZE = 1000;

  private generateKey(origins: string[], destinations: string[]): string {
    return `${origins.sort().join('|')}::${destinations.sort().join('|')}`;
  }

  get(origins: string[], destinations: string[]): CacheEntry | null {
    const key = this.generateKey(origins, destinations);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  set(origins: string[], destinations: string[], distances: number[][], durations: number[][]): void {
    const key = this.generateKey(origins, destinations);

    // Prevent unbounded growth
    if (this.cache.size >= this.MAX_SIZE) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      distances,
      durations,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
