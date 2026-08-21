import type { Airport } from "../domain/types";

export const DEMO_AIRPORTS = [
  { code: "MEX", name: "Aeropuerto Internacional Benito Juárez", city: "Ciudad de México", country: "México", countryCode: "MX", latitude: 19.4361, longitude: -99.0719, timezone: "America/Mexico_City" },
  { code: "NLU", name: "Aeropuerto Internacional Felipe Ángeles", city: "Ciudad de México", country: "México", countryCode: "MX", latitude: 19.7581, longitude: -99.0164, timezone: "America/Mexico_City" },
  { code: "GDL", name: "Aeropuerto Internacional Miguel Hidalgo y Costilla", city: "Guadalajara", country: "México", countryCode: "MX", latitude: 20.5218, longitude: -103.3112, timezone: "America/Mexico_City" },
  { code: "MTY", name: "Aeropuerto Internacional de Monterrey", city: "Monterrey", country: "México", countryCode: "MX", latitude: 25.7785, longitude: -100.107, timezone: "America/Monterrey" },
  { code: "BJX", name: "Aeropuerto Internacional del Bajío", city: "León", country: "México", countryCode: "MX", latitude: 20.9935, longitude: -101.4808, timezone: "America/Mexico_City" },
  { code: "QRO", name: "Aeropuerto Intercontinental de Querétaro", city: "Querétaro", country: "México", countryCode: "MX", latitude: 20.6173, longitude: -100.1857, timezone: "America/Mexico_City" },
  { code: "TIJ", name: "Aeropuerto Internacional de Tijuana", city: "Tijuana", country: "México", countryCode: "MX", latitude: 32.5411, longitude: -116.9702, timezone: "America/Tijuana" },
  { code: "CUN", name: "Aeropuerto Internacional de Cancún", city: "Cancún", country: "México", countryCode: "MX", latitude: 21.0365, longitude: -86.8771, timezone: "America/Cancun" },
  { code: "NRT", name: "Aeropuerto Internacional de Narita", city: "Tokio", country: "Japón", countryCode: "JP", latitude: 35.772, longitude: 140.3929, timezone: "Asia/Tokyo" },
  { code: "MAD", name: "Aeropuerto Adolfo Suárez Madrid-Barajas", city: "Madrid", country: "España", countryCode: "ES", latitude: 40.4983, longitude: -3.5676, timezone: "Europe/Madrid" },
  { code: "JFK", name: "Aeropuerto Internacional John F. Kennedy", city: "Nueva York", country: "Estados Unidos", countryCode: "US", latitude: 40.6413, longitude: -73.7781, timezone: "America/New_York" },
  { code: "CDG", name: "Aeropuerto de París-Charles de Gaulle", city: "París", country: "Francia", countryCode: "FR", latitude: 49.0097, longitude: 2.5479, timezone: "Europe/Paris" },
  { code: "YVR", name: "Aeropuerto Internacional de Vancouver", city: "Vancouver", country: "Canadá", countryCode: "CA", latitude: 49.1967, longitude: -123.1815, timezone: "America/Vancouver" },
  { code: "LIM", name: "Aeropuerto Internacional Jorge Chávez", city: "Lima", country: "Perú", countryCode: "PE", latitude: -12.0219, longitude: -77.1143, timezone: "America/Lima" },
  { code: "BOG", name: "Aeropuerto Internacional El Dorado", city: "Bogotá", country: "Colombia", countryCode: "CO", latitude: 4.7016, longitude: -74.1469, timezone: "America/Bogota" },
  { code: "EZE", name: "Aeropuerto Internacional Ministro Pistarini", city: "Buenos Aires", country: "Argentina", countryCode: "AR", latitude: -34.8222, longitude: -58.5358, timezone: "America/Argentina/Buenos_Aires" },
  { code: "GRU", name: "Aeropuerto Internacional de São Paulo-Guarulhos", city: "São Paulo", country: "Brasil", countryCode: "BR", latitude: -23.4356, longitude: -46.4731, timezone: "America/Sao_Paulo" },
  { code: "LAX", name: "Aeropuerto Internacional de Los Ángeles", city: "Los Ángeles", country: "Estados Unidos", countryCode: "US", latitude: 33.9416, longitude: -118.4085, timezone: "America/Los_Angeles" },
  { code: "LAS", name: "Aeropuerto Internacional Harry Reid", city: "Las Vegas", country: "Estados Unidos", countryCode: "US", latitude: 36.084, longitude: -115.1537, timezone: "America/Los_Angeles" },
  { code: "FCO", name: "Aeropuerto de Roma-Fiumicino", city: "Roma", country: "Italia", countryCode: "IT", latitude: 41.8003, longitude: 12.2389, timezone: "Europe/Rome" },
  { code: "SJO", name: "Aeropuerto Internacional Juan Santamaría", city: "San José", country: "Costa Rica", countryCode: "CR", latitude: 9.9982, longitude: -84.2041, timezone: "America/Costa_Rica" },
  { code: "HAV", name: "Aeropuerto Internacional José Martí", city: "La Habana", country: "Cuba", countryCode: "CU", latitude: 22.9892, longitude: -82.4091, timezone: "America/Havana" },
] as const satisfies readonly Airport[];

export const demoAirports: readonly Airport[] = DEMO_AIRPORTS;

export const AIRPORTS_BY_CODE: Readonly<Record<string, Airport>> = Object.freeze(
  Object.fromEntries(DEMO_AIRPORTS.map((airport) => [airport.code, airport])),
);

export function getAirport(code: string): Airport {
  const normalizedCode = code.trim().toUpperCase();
  const airport = AIRPORTS_BY_CODE[normalizedCode];
  if (!airport) throw new RangeError(`Aeropuerto desconocido: ${normalizedCode || "(vacío)"}`);
  return airport;
}
