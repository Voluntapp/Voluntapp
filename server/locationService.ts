// Simple geocoding service for location to coordinates conversion
// In production, this would use a real geocoding API like Google Maps or Mapbox

interface Coordinates {
  latitude: number;
  longitude: number;
}

// Mock coordinates for common US cities (for demo purposes)
const CITY_COORDINATES: Record<string, Coordinates> = {
  "san francisco, ca": { latitude: 37.7749, longitude: -122.4194 },
  "san francisco": { latitude: 37.7749, longitude: -122.4194 },
  "new york, ny": { latitude: 40.7128, longitude: -74.0060 },
  "new york": { latitude: 40.7128, longitude: -74.0060 },
  "los angeles, ca": { latitude: 34.0522, longitude: -118.2437 },
  "los angeles": { latitude: 34.0522, longitude: -118.2437 },
  "chicago, il": { latitude: 41.8781, longitude: -87.6298 },
  "chicago": { latitude: 41.8781, longitude: -87.6298 },
  "houston, tx": { latitude: 29.7604, longitude: -95.3698 },
  "houston": { latitude: 29.7604, longitude: -95.3698 },
  "austin, tx": { latitude: 30.2672, longitude: -97.7431 },
  "austin": { latitude: 30.2672, longitude: -97.7431 },
  "seattle, wa": { latitude: 47.6062, longitude: -122.3321 },
  "seattle": { latitude: 47.6062, longitude: -122.3321 },
  "boston, ma": { latitude: 42.3601, longitude: -71.0589 },
  "boston": { latitude: 42.3601, longitude: -71.0589 },
  "denver, co": { latitude: 39.7392, longitude: -104.9903 },
  "denver": { latitude: 39.7392, longitude: -104.9903 },
  "portland, or": { latitude: 45.5152, longitude: -122.6784 },
  "portland": { latitude: 45.5152, longitude: -122.6784 },
};

export function geocodeLocation(location: string): Coordinates | null {
  const normalized = location.toLowerCase().trim();
  return CITY_COORDINATES[normalized] || null;
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
