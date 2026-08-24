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
  { code: "LHR", name: "Aeropuerto de Londres-Heathrow", city: "Londres", country: "Reino Unido", countryCode: "GB", latitude: 51.47, longitude: -0.4543, timezone: "Europe/London" },
  { code: "LIS", name: "Aeropuerto Humberto Delgado", city: "Lisboa", country: "Portugal", countryCode: "PT", latitude: 38.7742, longitude: -9.1342, timezone: "Europe/Lisbon" },
  { code: "IST", name: "Aeropuerto de Estambul", city: "Estambul", country: "Turquía", countryCode: "TR", latitude: 41.2753, longitude: 28.7519, timezone: "Europe/Istanbul" },
  { code: "ATH", name: "Aeropuerto Internacional de Atenas", city: "Atenas", country: "Grecia", countryCode: "GR", latitude: 37.9364, longitude: 23.9445, timezone: "Europe/Athens" },
  { code: "DUB", name: "Aeropuerto de Dublín", city: "Dublín", country: "Irlanda", countryCode: "IE", latitude: 53.4213, longitude: -6.2701, timezone: "Europe/Dublin" },
  { code: "DXB", name: "Aeropuerto Internacional de Dubái", city: "Dubái", country: "Emiratos Árabes Unidos", countryCode: "AE", latitude: 25.2532, longitude: 55.3657, timezone: "Asia/Dubai" },
  { code: "DOH", name: "Aeropuerto Internacional Hamad", city: "Doha", country: "Catar", countryCode: "QA", latitude: 25.2731, longitude: 51.6081, timezone: "Asia/Qatar" },
  { code: "BKK", name: "Aeropuerto Suvarnabhumi", city: "Bangkok", country: "Tailandia", countryCode: "TH", latitude: 13.69, longitude: 100.7501, timezone: "Asia/Bangkok" },
  { code: "ICN", name: "Aeropuerto Internacional de Incheon", city: "Seúl", country: "Corea del Sur", countryCode: "KR", latitude: 37.4602, longitude: 126.4407, timezone: "Asia/Seoul" },
  { code: "SIN", name: "Aeropuerto de Singapur-Changi", city: "Singapur", country: "Singapur", countryCode: "SG", latitude: 1.3644, longitude: 103.9915, timezone: "Asia/Singapore" },
  { code: "SCL", name: "Aeropuerto Internacional Arturo Merino Benítez", city: "Santiago", country: "Chile", countryCode: "CL", latitude: -33.3929, longitude: -70.7858, timezone: "America/Santiago" },
  { code: "MVD", name: "Aeropuerto Internacional de Carrasco", city: "Montevideo", country: "Uruguay", countryCode: "UY", latitude: -34.8384, longitude: -56.0308, timezone: "America/Montevideo" },
  { code: "UIO", name: "Aeropuerto Internacional Mariscal Sucre", city: "Quito", country: "Ecuador", countryCode: "EC", latitude: -0.1254, longitude: -78.3547, timezone: "America/Guayaquil" },
  { code: "PTY", name: "Aeropuerto Internacional de Tocumen", city: "Ciudad de Panamá", country: "Panamá", countryCode: "PA", latitude: 9.0714, longitude: -79.3835, timezone: "America/Panama" },
  { code: "CPT", name: "Aeropuerto Internacional de Ciudad del Cabo", city: "Ciudad del Cabo", country: "Sudáfrica", countryCode: "ZA", latitude: -33.97, longitude: 18.6, timezone: "Africa/Johannesburg" },
  { code: "NYC", name: "Aeropuertos de Nueva York", city: "Nueva York", country: "Estados Unidos", countryCode: "US", latitude: 40.7128, longitude: -74.006, timezone: "America/New_York" },
  { code: "MIA", name: "Aeropuerto Internacional de Miami", city: "Miami", country: "Estados Unidos", countryCode: "US", latitude: 25.7959, longitude: -80.287, timezone: "America/New_York" },
  { code: "CHI", name: "Aeropuertos de Chicago", city: "Chicago", country: "Estados Unidos", countryCode: "US", latitude: 41.8781, longitude: -87.6298, timezone: "America/Chicago" },
  { code: "ORL", name: "Aeropuertos de Orlando", city: "Orlando", country: "Estados Unidos", countryCode: "US", latitude: 28.5383, longitude: -81.3792, timezone: "America/New_York" },
  { code: "OAK", name: "Aeropuerto Internacional de Oakland", city: "San Francisco", country: "Estados Unidos", countryCode: "US", latitude: 37.7126, longitude: -122.2197, timezone: "America/Los_Angeles" },
  { code: "DEN", name: "Aeropuerto Internacional de Denver", city: "Denver", country: "Estados Unidos", countryCode: "US", latitude: 39.8561, longitude: -104.6737, timezone: "America/Denver" },
  { code: "ATL", name: "Aeropuerto Internacional Hartsfield-Jackson", city: "Atlanta", country: "Estados Unidos", countryCode: "US", latitude: 33.6407, longitude: -84.4277, timezone: "America/New_York" },
  { code: "YTO", name: "Aeropuertos de Toronto", city: "Toronto", country: "Canadá", countryCode: "CA", latitude: 43.6532, longitude: -79.3832, timezone: "America/Toronto" },
  { code: "MDE", name: "Aeropuerto Internacional José María Córdova", city: "Medellín", country: "Colombia", countryCode: "CO", latitude: 6.1645, longitude: -75.4231, timezone: "America/Bogota" },
  { code: "CTG", name: "Aeropuerto Internacional Rafael Núñez", city: "Cartagena", country: "Colombia", countryCode: "CO", latitude: 10.4424, longitude: -75.513, timezone: "America/Bogota" },
  { code: "CLO", name: "Aeropuerto Internacional Alfonso Bonilla Aragón", city: "Cali", country: "Colombia", countryCode: "CO", latitude: 3.5432, longitude: -76.3816, timezone: "America/Bogota" },
  { code: "BUE", name: "Aeropuertos de Buenos Aires", city: "Buenos Aires", country: "Argentina", countryCode: "AR", latitude: -34.6037, longitude: -58.3816, timezone: "America/Argentina/Buenos_Aires" },
  { code: "SAO", name: "Aeropuertos de São Paulo", city: "São Paulo", country: "Brasil", countryCode: "BR", latitude: -23.5505, longitude: -46.6333, timezone: "America/Sao_Paulo" },
  { code: "RIO", name: "Aeropuertos de Río de Janeiro", city: "Río de Janeiro", country: "Brasil", countryCode: "BR", latitude: -22.9068, longitude: -43.1729, timezone: "America/Sao_Paulo" },
  { code: "FLN", name: "Aeropuerto Internacional Hercílio Luz", city: "Florianópolis", country: "Brasil", countryCode: "BR", latitude: -27.6703, longitude: -48.5525, timezone: "America/Sao_Paulo" },
  { code: "PAR", name: "Aeropuertos de París", city: "París", country: "Francia", countryCode: "FR", latitude: 48.8566, longitude: 2.3522, timezone: "Europe/Paris" },
  { code: "LYS", name: "Aeropuerto de Lyon-Saint Exupéry", city: "Lyon", country: "Francia", countryCode: "FR", latitude: 45.7256, longitude: 5.0811, timezone: "Europe/Paris" },
  { code: "ROM", name: "Aeropuertos de Roma", city: "Roma", country: "Italia", countryCode: "IT", latitude: 41.9028, longitude: 12.4964, timezone: "Europe/Rome" },
  { code: "PMO", name: "Aeropuerto de Palermo-Punta Raisi", city: "Palermo", country: "Italia", countryCode: "IT", latitude: 38.1759, longitude: 13.091, timezone: "Europe/Rome" },
  { code: "TYO", name: "Aeropuertos de Tokio", city: "Tokio", country: "Japón", countryCode: "JP", latitude: 35.6762, longitude: 139.6503, timezone: "Asia/Tokyo" },
  { code: "OSA", name: "Aeropuertos de Osaka", city: "Osaka", country: "Japón", countryCode: "JP", latitude: 34.6937, longitude: 135.5023, timezone: "Asia/Tokyo" },
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
