import type { Location } from './distance-calculator';

export interface Stop {
  id: string;
  location: Location;
  passengerId: string;
  passengerName: string;
  demand: number; // number of seats required
}

export interface Vehicle {
  id: string;
  capacity: number;
  startLocation: Location;
}

export interface RouteResult {
  vehicleId: string;
  stops: Stop[];
  totalDistance: number;
  totalDuration: number;
  utilizationRate: number;
}

export class VRPSolver {
  /**
   * Clarke-Wright Savings Algorithm
   * A heuristic for solving the Vehicle Routing Problem
   */
  solve(
    vehicles: Vehicle[],
    stops: Stop[],
    distanceMatrix: number[][],
    durationMatrix: number[][]
  ): RouteResult[] {
    const routes: RouteResult[] = [];
    const unassignedStops = [...stops];

    // Sort vehicles by capacity (largest first)
    const sortedVehicles = [...vehicles].sort((a, b) => b.capacity - a.capacity);

    for (const vehicle of sortedVehicles) {
      if (unassignedStops.length === 0) break;

      const route = this.buildRouteForVehicle(
        vehicle,
        unassignedStops,
        distanceMatrix,
        durationMatrix
      );

      if (route.stops.length > 0) {
        routes.push(route);
        // Remove assigned stops
        route.stops.forEach(stop => {
          const index = unassignedStops.findIndex(s => s.id === stop.id);
          if (index !== -1) {
            unassignedStops.splice(index, 1);
          }
        });
      }
    }

    return routes;
  }

  private buildRouteForVehicle(
    vehicle: Vehicle,
    availableStops: Stop[],
    distanceMatrix: number[][],
    durationMatrix: number[][]
  ): RouteResult {
    const route: Stop[] = [];
    let currentCapacity = 0;
    let totalDistance = 0;
    let totalDuration = 0;
    const remainingStops = [...availableStops];

    // Greedy nearest neighbor with capacity constraint
    let currentLocation = vehicle.startLocation;
    let currentIndex = -1; // depot

    while (remainingStops.length > 0) {
      let nearestStop: Stop | null = null;
      let nearestDistance = Infinity;
      let nearestIndex = -1;
      let nearestStopOriginalIndex = -1;

      for (let i = 0; i < remainingStops.length; i++) {
        const stop = remainingStops[i];
        
        // Check capacity constraint
        if (currentCapacity + stop.demand > vehicle.capacity) {
          continue;
        }

        // Calculate distance from current location
        const stopIndex = availableStops.indexOf(stop);
        const distance = this.calculateDistance(
          currentLocation,
          stop.location,
          currentIndex,
          stopIndex,
          distanceMatrix
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestStop = stop;
          nearestIndex = i;
          nearestStopOriginalIndex = stopIndex;
        }
      }

      // Break if no stop can fit (prevents infinite loop)
      if (!nearestStop) break;

      route.push(nearestStop);
      currentCapacity += nearestStop.demand;
      totalDistance += nearestDistance;
      totalDuration += this.calculateDuration(
        currentIndex,
        nearestStopOriginalIndex,
        durationMatrix
      );

      currentLocation = nearestStop.location;
      currentIndex = nearestStopOriginalIndex;

      // Remove from remaining stops using the correct index
      remainingStops.splice(nearestIndex, 1);
    }

    // Optimize route order using 2-opt
    if (route.length > 2) {
      this.twoOptOptimization(route, distanceMatrix, availableStops);
    }

    return {
      vehicleId: vehicle.id,
      stops: route,
      totalDistance,
      totalDuration,
      utilizationRate: currentCapacity / vehicle.capacity,
    };
  }

  private calculateDistance(
    from: Location,
    to: Location,
    fromIndex: number,
    toIndex: number,
    distanceMatrix: number[][]
  ): number {
    if (fromIndex === -1 || toIndex === -1) {
      // Calculate Haversine distance for depot
      return this.haversineDistance(from, to);
    }
    
    // FIX: Validate array bounds before access
    if (fromIndex < 0 || fromIndex >= distanceMatrix.length ||
        toIndex < 0 || !distanceMatrix[fromIndex] || 
        toIndex >= distanceMatrix[fromIndex].length) {
      console.warn(`Invalid distance matrix indices: [${fromIndex}][${toIndex}]`);
      return this.haversineDistance(from, to);
    }
    
    return distanceMatrix[fromIndex][toIndex];
  }

  private calculateDuration(
    fromIndex: number,
    toIndex: number,
    durationMatrix: number[][]
  ): number {
    if (fromIndex === -1 || toIndex === -1) {
      return 0;
    }
    
    // FIX: Validate array bounds before access
    if (fromIndex < 0 || fromIndex >= durationMatrix.length ||
        toIndex < 0 || !durationMatrix[fromIndex] || 
        toIndex >= durationMatrix[fromIndex].length) {
      console.warn(`Invalid duration matrix indices: [${fromIndex}][${toIndex}]`);
      return 0;
    }
    
    return durationMatrix[fromIndex][toIndex];
  }

  private haversineDistance(loc1: Location, loc2: Location): number {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRad(loc2.lat - loc1.lat);
    const dLon = this.toRad(loc2.lng - loc1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(loc1.lat)) *
        Math.cos(this.toRad(loc2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private twoOptOptimization(
    route: Stop[],
    distanceMatrix: number[][],
    allStops: Stop[]
  ): void {
    // FIX: Add iteration limit to prevent infinite loops
    const MAX_ITERATIONS = 1000;
    let iterations = 0;
    
    // FIX: Pre-calculate indices to avoid repeated indexOf calls (O(n³) → O(n²))
    const routeIndices = route.map(stop => {
      const idx = allStops.indexOf(stop);
      if (idx === -1) {
        console.warn('Stop not found in allStops array');
        return 0; // Fallback to prevent crash
      }
      return idx;
    });
    
    // FIX: Use epsilon for floating point comparison
    const EPSILON = 0.001;
    
    let improved = true;
    while (improved && iterations < MAX_ITERATIONS) {
      improved = false;
      iterations++;
      
      for (let i = 0; i < route.length - 1; i++) {
        for (let j = i + 2; j < route.length; j++) {
          const nextI = (i + 1) % route.length;
          const nextJ = (j + 1) % route.length;
          
          // FIX: Validate indices before accessing matrix
          if (routeIndices[i] === -1 || routeIndices[nextI] === -1 || 
              routeIndices[j] === -1 || routeIndices[nextJ] === -1) {
            continue;
          }
          
          const currentDistance =
            distanceMatrix[routeIndices[i]][routeIndices[nextI]] +
            distanceMatrix[routeIndices[j]][routeIndices[nextJ]];

          const newDistance =
            distanceMatrix[routeIndices[i]][routeIndices[j]] +
            distanceMatrix[routeIndices[nextI]][routeIndices[nextJ]];

          // FIX: Use epsilon comparison for floats
          if (newDistance < currentDistance - EPSILON) {
            // Reverse the segment between i+1 and j
            this.reverseSegment(route, i + 1, j);
            
            // FIX: Update indices after reversal
            const segment = routeIndices.slice(i + 1, j + 1).reverse();
            routeIndices.splice(i + 1, segment.length, ...segment);
            
            improved = true;
          }
        }
      }
    }
    
    if (iterations >= MAX_ITERATIONS) {
      console.warn('2-opt optimization reached maximum iterations limit');
    }
  }

  private reverseSegment(route: Stop[], start: number, end: number): void {
    while (start < end) {
      [route[start], route[end]] = [route[end], route[start]];
      start++;
      end--;
    }
  }
}
