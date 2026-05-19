import { DistanceCalculator, type Location } from './distance-calculator';
import { VRPSolver, type Stop, type Vehicle, type RouteResult } from './vrp-solver';

export class RouteOptimizer {
  private distanceCalculator: DistanceCalculator;
  private vrpSolver: VRPSolver;

  constructor(googleMapsApiKey: string) {
    this.distanceCalculator = new DistanceCalculator(googleMapsApiKey);
    this.vrpSolver = new VRPSolver();
  }

  async optimizeRoutes(
    vehicles: Vehicle[],
    stops: Stop[]
  ): Promise<RouteResult[]> {
    // Extract all unique locations
    const locations: Location[] = stops.map(stop => stop.location);

    // Calculate distance and duration matrices
    const { distances, durations } = await this.distanceCalculator.calculateDistanceMatrix(
      locations,
      locations
    );

    // Solve VRP
    const routes = this.vrpSolver.solve(vehicles, stops, distances, durations);

    return routes;
  }

  async calculateRouteDetails(route: RouteResult, depot: Location) {
    if (route.stops.length === 0) {
      return null;
    }

    const waypoints = route.stops.map(stop => stop.location);
    const directions = await this.distanceCalculator.getDirections(
      depot,
      depot,
      waypoints
    );

    return {
      ...route,
      polyline: directions.overview_polyline.points,
      legs: directions.legs,
    };
  }
}
