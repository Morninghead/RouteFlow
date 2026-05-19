# Deep Security & Bug Audit - Critical Issues Found

## 🚨 CRITICAL ISSUES DISCOVERED

### 1. **Race Condition in Offline Queue - CRITICAL**
**File:** `apps/driver/src/hooks/useOfflineQueue.ts`
**Lines:** 86-90, 100-101

**Issue:**
```typescript
// Line 86-90: saveQueue called inside setState callback
setQueue(currentQueue => {
  const newQueue = [...currentQueue, item];
  saveQueue(newQueue);  // ❌ ASYNC operation not awaited
  return newQueue;
});

// Line 100-101: processQueue reads stale queue
const processQueue = async () => {
  if (processing || queue.length === 0) return;  // ❌ Reads old state
  const updatedQueue = [...queue];  // ❌ May be stale
```

**Race Condition Scenario:**
1. User adds item → `addToQueue` called
2. `setQueue` updates state asynchronously
3. `saveQueue` called but not awaited
4. `processQueue` called immediately (line 94)
5. `processQueue` reads OLD queue state (line 105)
6. Item may be processed before being saved to storage
7. If app crashes, item is lost

**Impact:** Data loss, duplicate processing, inconsistent state

---

### 2. **Rate Limiter Memory Leak - HIGH**
**File:** `apps/web/src/middleware.ts`
**Lines:** 5, 39-45

**Issue:**
```typescript
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup only happens 1% of the time
if (Math.random() < 0.01) {  // ❌ Probabilistic cleanup
  for (const [k, v] of rateLimitStore.entries()) {
    if (now > v.resetTime) {
      rateLimitStore.delete(k);
    }
  }
}
```

**Problems:**
1. Map grows unbounded in multi-instance deployments
2. Cleanup is probabilistic (1% chance)
3. With 1000 req/min, cleanup runs ~10 times/min
4. But 1000 new entries added/min
5. Net growth: 990 entries/min = 1.4M entries/day
6. Each entry ~100 bytes = 140MB/day memory leak

**Impact:** Memory exhaustion, server crash

---

### 3. **VRP Solver Infinite Loop (2-opt) - CRITICAL**
**File:** `packages/routing/src/vrp-solver.ts`
**Lines:** 196-216

**Issue:**
```typescript
private twoOptOptimization(route: Stop[], distanceMatrix: number[][], allStops: Stop[]): void {
  let improved = true;
  while (improved) {  // ❌ No iteration limit
    improved = false;
    for (let i = 0; i < route.length - 1; i++) {
      for (let j = i + 2; j < route.length; j++) {
        // indexOf called repeatedly in tight loop
        const currentDistance =
          distanceMatrix[allStops.indexOf(route[i])][allStops.indexOf(route[i + 1])] +
          distanceMatrix[allStops.indexOf(route[j])][allStops.indexOf(route[(j + 1) % route.length])];
```

**Problems:**
1. No maximum iteration limit → can run forever
2. `indexOf` called 4 times per inner loop iteration
3. With 50 stops: 50 * 48 * 4 = 9,600 indexOf calls per iteration
4. indexOf is O(n) → total O(n³) per iteration
5. If improvements keep happening, infinite loop
6. Floating point precision issues can cause endless improvements

**Impact:** Server hangs, timeout, DoS

---

### 4. **Array Index Out of Bounds - HIGH**
**File:** `packages/routing/src/vrp-solver.ts`
**Lines:** 203, 207

**Issue:**
```typescript
distanceMatrix[allStops.indexOf(route[(j + 1) % route.length])]
```

**Problem:**
- `(j + 1) % route.length` can be 0
- `route[0]` is valid
- But `allStops.indexOf(route[0])` may return -1 if route was modified
- `distanceMatrix[-1]` → undefined
- `distanceMatrix[-1][anything]` → TypeError

**Impact:** Runtime crash

---

### 5. **JSONB Injection in RLS Policy - MEDIUM**
**File:** `supabase/migrations/20240101000001_rls_policies.sql`
**Line:** 121

**Issue:**
```sql
guardians @> jsonb_build_array(jsonb_build_object('userId', (SELECT id FROM users WHERE firebase_uid = auth.uid()::TEXT)))
```

**Problem:**
- If `auth.uid()` is manipulated to return malicious JSON
- `jsonb_build_object` could be exploited
- No validation on userId format
- Subquery can return NULL → policy may fail open

**Impact:** Unauthorized data access

---

### 6. **Notification Service - No Error Handling**
**File:** `packages/notifications/src/notification-service.ts`
**Lines:** 54-77

**Issue:**
```typescript
if (channels.includes('telegram') && this.telegram && recipients.telegram) {
  const message = this.formatMessage(payload, 'telegram');
  
  if (payload.photoUrl) {
    results.telegram = await this.telegram.sendPhoto({  // ❌ No try-catch
      chatId: recipients.telegram,
      text: message,
      photo: payload.photoUrl,
    });
  }
  
  if (payload.location) {
    await this.telegram.sendLocation(  // ❌ Not awaited in results
      recipients.telegram,
      payload.location.lat,
      payload.location.lng
    );
  }
}
```

**Problems:**
1. No try-catch → one failure stops all notifications
2. Telegram failure prevents LINE and FCM from sending
3. Location send not awaited → race condition
4. No retry logic
5. No timeout handling

**Impact:** Notification failures cascade, users not notified

---

### 7. **Distance Calculator - No Rate Limiting**
**File:** `packages/routing/src/distance-calculator.ts`
**Lines:** 22-63

**Issue:**
```typescript
async calculateDistanceMatrix(origins: Location[], destinations: Location[]) {
  // No rate limiting, no retry, no caching
  const response = await this.client.distancematrix({
    params: {
      origins: origins.map(loc => `${loc.lat},${loc.lng}`),
      destinations: destinations.map(loc => `${loc.lat},${loc.lng}`),
      // ...
    },
  });
```

**Problems:**
1. No rate limiting → can exhaust Google Maps quota
2. No caching → same routes calculated repeatedly
3. No retry on failure
4. No request batching
5. 50 origins × 50 destinations = 2,500 API calls
6. Google Maps limit: 100 elements per request
7. Will fail silently with large datasets

**Impact:** API quota exhaustion, high costs, failures

---

### 8. **Geolocation Watch Not Cleaned Up Properly**
**File:** `apps/driver/src/hooks/useGeolocation.ts`
**Lines:** 32, 58-62

**Issue:**
```typescript
let watchId: string | null = null;

const startTracking = async () => {
  watchId = await Geolocation.watchPosition(/* ... */);
};

return () => {
  if (watchId) {  // ❌ watchId may still be null if async not complete
    Geolocation.clearWatch({ id: watchId });
  }
};
```

**Race Condition:**
1. Component mounts, `trackingEnabled = true`
2. `startTracking()` called (async)
3. Component unmounts immediately
4. Cleanup runs, `watchId` still null
5. `startTracking` completes after unmount
6. Watch never cleared → memory leak

**Impact:** Battery drain, memory leak

---

### 9. **Supabase Adapter - No Transaction Support**
**File:** `packages/storage/src/supabase-adapter.ts`
**Lines:** 99-107, 146-154

**Issue:**
```typescript
create: async (input: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
  const { data, error } = await this.supabase
    .from('users')
    .insert(this.unmapUser(input))
    .select()
    .single();
  if (error) throw error;
  return this.mapUser(data);
}
```

**Problems:**
1. No transaction support for related inserts
2. Creating user + driver requires 2 separate calls
3. If driver insert fails, user already created
4. No rollback mechanism
5. Orphaned records possible

**Impact:** Data inconsistency

---

### 10. **Timing Attack on Rate Limiter**
**File:** `apps/web/src/middleware.ts`
**Lines:** 19-29

**Issue:**
```typescript
const record = rateLimitStore.get(key);

if (record) {
  if (now < record.resetTime) {
    if (record.count >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(/* ... */, { status: 429 });  // ❌ Immediate response
    }
    record.count++;  // ❌ Mutates shared object
  }
}
```

**Problems:**
1. Response time differs: rate limited vs allowed
2. Attacker can measure timing to detect limits
3. `record.count++` mutates shared object (not thread-safe)
4. Multiple requests can increment simultaneously
5. Race condition allows bypassing limit

**Impact:** Rate limit bypass, timing attack

---

## 🔧 REQUIRED FIXES

### Fix 1: Offline Queue Race Condition
```typescript
const addToQueue = useCallback(
  async (type: QueueItem['type'], data: any) => {
    const item: QueueItem = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    // FIX: Await saveQueue before updating state
    const newQueue = [...queue, item];
    await saveQueue(newQueue);
    
    // Try to process immediately if online
    if (isOnline && !processing) {
      processQueue();
    }
  },
  [queue, isOnline, processing]
);

// FIX: Use ref to track processing state
const processingRef = useRef(false);

const processQueue = async () => {
  if (processingRef.current) return;
  
  processingRef.current = true;
  setProcessing(true);
  
  // Load latest queue from storage
  const { value } = await Preferences.get({ key: QUEUE_KEY });
  const currentQueue = value ? JSON.parse(value) : [];
  
  if (currentQueue.length === 0) {
    processingRef.current = false;
    setProcessing(false);
    return;
  }
  
  // ... rest of processing
  
  processingRef.current = false;
  setProcessing(false);
};
```

### Fix 2: Rate Limiter Memory Leak
```typescript
// Use LRU cache with max size
import LRU from 'lru-cache';

const rateLimitStore = new LRU<string, { count: number; resetTime: number }>({
  max: 10000, // Maximum 10k entries
  ttl: RATE_LIMIT_WINDOW,
  updateAgeOnGet: false,
});

// OR use deterministic cleanup
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60000; // 1 minute

if (now - lastCleanup > CLEANUP_INTERVAL) {
  for (const [k, v] of rateLimitStore.entries()) {
    if (now > v.resetTime) {
      rateLimitStore.delete(k);
    }
  }
  lastCleanup = now;
}
```

### Fix 3: VRP 2-opt Infinite Loop
```typescript
private twoOptOptimization(route: Stop[], distanceMatrix: number[][], allStops: Stop[]): void {
  // FIX: Add iteration limit
  const MAX_ITERATIONS = 1000;
  let iterations = 0;
  
  // FIX: Pre-calculate indices
  const routeIndices = route.map(stop => allStops.indexOf(stop));
  
  let improved = true;
  while (improved && iterations < MAX_ITERATIONS) {
    improved = false;
    iterations++;
    
    for (let i = 0; i < route.length - 1; i++) {
      for (let j = i + 2; j < route.length; j++) {
        // FIX: Use pre-calculated indices
        const currentDistance =
          distanceMatrix[routeIndices[i]][routeIndices[i + 1]] +
          distanceMatrix[routeIndices[j]][routeIndices[(j + 1) % route.length]];

        const newDistance =
          distanceMatrix[routeIndices[i]][routeIndices[j]] +
          distanceMatrix[routeIndices[i + 1]][routeIndices[(j + 1) % route.length]];

        // FIX: Use epsilon for float comparison
        const EPSILON = 0.001;
        if (newDistance < currentDistance - EPSILON) {
          this.reverseSegment(route, i + 1, j);
          // Update indices after reversal
          const segment = routeIndices.slice(i + 1, j + 1).reverse();
          routeIndices.splice(i + 1, segment.length, ...segment);
          improved = true;
        }
      }
    }
  }
  
  if (iterations >= MAX_ITERATIONS) {
    console.warn('2-opt optimization reached max iterations');
  }
}
```

### Fix 4: Notification Error Handling
```typescript
async sendNotification(
  channels: Array<'telegram' | 'line' | 'fcm'>,
  recipients: { telegram?: string; line?: string; fcm?: string },
  payload: NotificationPayload
): Promise<{ telegram?: boolean; line?: boolean; fcm?: boolean; errors?: string[] }> {
  const results: any = {};
  const errors: string[] = [];

  // FIX: Send in parallel with individual error handling
  const promises = [];

  if (channels.includes('telegram') && this.telegram && recipients.telegram) {
    promises.push(
      (async () => {
        try {
          const message = this.formatMessage(payload, 'telegram');
          
          if (payload.photoUrl) {
            results.telegram = await this.telegram.sendPhoto({
              chatId: recipients.telegram,
              text: message,
              photo: payload.photoUrl,
            });
          } else {
            results.telegram = await this.telegram.sendMessage({
              chatId: recipients.telegram,
              text: message,
            });
          }

          if (payload.location) {
            await this.telegram.sendLocation(
              recipients.telegram,
              payload.location.lat,
              payload.location.lng
            );
          }
        } catch (error) {
          errors.push(`Telegram: ${error.message}`);
          results.telegram = false;
        }
      })()
    );
  }

  // Similar for LINE and FCM...

  await Promise.allSettled(promises);

  return { ...results, errors: errors.length > 0 ? errors : undefined };
}
```

### Fix 5: Geolocation Cleanup
```typescript
export function useGeolocation(trackingEnabled: boolean = false) {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const watchIdRef = useRef<string | null>(null);  // FIX: Use ref

  useEffect(() => {
    if (!trackingEnabled) {
      // FIX: Clear watch if disabled
      if (watchIdRef.current) {
        Geolocation.clearWatch({ id: watchIdRef.current });
        watchIdRef.current = null;
      }
      return;
    }

    const startTracking = async () => {
      try {
        const id = await Geolocation.watchPosition(
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
          (pos, err) => {
            if (err) {
              setError(err.message);
            } else if (pos) {
              setPosition(pos);
              setError(null);
            }
          }
        );
        watchIdRef.current = id;  // FIX: Store in ref
      } catch (err: any) {
        setError(err.message || 'Failed to start tracking');
      }
    };

    startTracking();

    return () => {
      // FIX: Always clear, ref is synchronous
      if (watchIdRef.current) {
        Geolocation.clearWatch({ id: watchIdRef.current });
        watchIdRef.current = null;
      }
    };
  }, [trackingEnabled]);

  return { position, error, loading, getCurrentPosition };
}
```

## 📊 Summary

| Issue | Severity | Impact | Fix Priority |
|-------|----------|--------|--------------|
| Offline Queue Race Condition | CRITICAL | Data loss | IMMEDIATE |
| Rate Limiter Memory Leak | HIGH | Server crash | IMMEDIATE |
| VRP 2-opt Infinite Loop | CRITICAL | DoS | IMMEDIATE |
| Array Index Out of Bounds | HIGH | Crash | HIGH |
| JSONB Injection | MEDIUM | Data breach | HIGH |
| Notification Cascade Failure | MEDIUM | User impact | MEDIUM |
| Distance API No Limits | HIGH | Cost/Quota | HIGH |
| Geolocation Memory Leak | MEDIUM | Battery drain | MEDIUM |
| No Transaction Support | MEDIUM | Data inconsistency | LOW |
| Timing Attack | LOW | Security | LOW |

**Total Critical Issues:** 2  
**Total High Issues:** 4  
**Total Medium Issues:** 4  
**Total Low Issues:** 0

All issues require fixes before production deployment.
