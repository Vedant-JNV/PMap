import { Issue, IssueCategory, calculateSeverity } from '@/types/issues';

const categories: IssueCategory[] = ['water', 'roads', 'garbage', 'traffic', 'lighting', 'safety', 'other'];

// Major cities worldwide with realistic urban issue hotspots
const WORLD_CITIES = {
  // Asia
  newDelhi: { lat: 28.6139, lng: 77.2090, name: 'New Delhi', country: 'India' },
  mumbai: { lat: 19.0760, lng: 72.8777, name: 'Mumbai', country: 'India' },
  tokyo: { lat: 35.6762, lng: 139.6503, name: 'Tokyo', country: 'Japan' },
  shanghai: { lat: 31.2304, lng: 121.4737, name: 'Shanghai', country: 'China' },
  beijing: { lat: 39.9042, lng: 116.4074, name: 'Beijing', country: 'China' },
  bangkok: { lat: 13.7563, lng: 100.5018, name: 'Bangkok', country: 'Thailand' },
  singapore: { lat: 1.3521, lng: 103.8198, name: 'Singapore', country: 'Singapore' },
  jakarta: { lat: -6.2088, lng: 106.8456, name: 'Jakarta', country: 'Indonesia' },
  manila: { lat: 14.5995, lng: 120.9842, name: 'Manila', country: 'Philippines' },
  seoul: { lat: 37.5665, lng: 126.9780, name: 'Seoul', country: 'South Korea' },
  hongKong: { lat: 22.3193, lng: 114.1694, name: 'Hong Kong', country: 'China' },
  dubai: { lat: 25.2048, lng: 55.2708, name: 'Dubai', country: 'UAE' },
  
  // Europe
  london: { lat: 51.5074, lng: -0.1278, name: 'London', country: 'UK' },
  paris: { lat: 48.8566, lng: 2.3522, name: 'Paris', country: 'France' },
  berlin: { lat: 52.5200, lng: 13.4050, name: 'Berlin', country: 'Germany' },
  rome: { lat: 41.9028, lng: 12.4964, name: 'Rome', country: 'Italy' },
  madrid: { lat: 40.4168, lng: -3.7038, name: 'Madrid', country: 'Spain' },
  amsterdam: { lat: 52.3676, lng: 4.9041, name: 'Amsterdam', country: 'Netherlands' },
  vienna: { lat: 48.2082, lng: 16.3738, name: 'Vienna', country: 'Austria' },
  prague: { lat: 50.0755, lng: 14.4378, name: 'Prague', country: 'Czech Republic' },
  moscow: { lat: 55.7558, lng: 37.6173, name: 'Moscow', country: 'Russia' },
  istanbul: { lat: 41.0082, lng: 28.9784, name: 'Istanbul', country: 'Turkey' },
  
  // Americas
  newYork: { lat: 40.7128, lng: -74.0060, name: 'New York', country: 'USA' },
  losAngeles: { lat: 34.0522, lng: -118.2437, name: 'Los Angeles', country: 'USA' },
  chicago: { lat: 41.8781, lng: -87.6298, name: 'Chicago', country: 'USA' },
  sanFrancisco: { lat: 37.7749, lng: -122.4194, name: 'San Francisco', country: 'USA' },
  miami: { lat: 25.7617, lng: -80.1918, name: 'Miami', country: 'USA' },
  toronto: { lat: 43.6532, lng: -79.3832, name: 'Toronto', country: 'Canada' },
  mexicoCity: { lat: 19.4326, lng: -99.1332, name: 'Mexico City', country: 'Mexico' },
  saoPaulo: { lat: -23.5505, lng: -46.6333, name: 'São Paulo', country: 'Brazil' },
  buenosAires: { lat: -34.6037, lng: -58.3816, name: 'Buenos Aires', country: 'Argentina' },
  bogota: { lat: 4.7110, lng: -74.0721, name: 'Bogotá', country: 'Colombia' },
  lima: { lat: -12.0464, lng: -77.0428, name: 'Lima', country: 'Peru' },
  
  // Africa
  cairo: { lat: 30.0444, lng: 31.2357, name: 'Cairo', country: 'Egypt' },
  lagos: { lat: 6.5244, lng: 3.3792, name: 'Lagos', country: 'Nigeria' },
  johannesburg: { lat: -26.2041, lng: 28.0473, name: 'Johannesburg', country: 'South Africa' },
  nairobi: { lat: -1.2921, lng: 36.8219, name: 'Nairobi', country: 'Kenya' },
  casablanca: { lat: 33.5731, lng: -7.5898, name: 'Casablanca', country: 'Morocco' },
  
  // Oceania
  sydney: { lat: -33.8688, lng: 151.2093, name: 'Sydney', country: 'Australia' },
  melbourne: { lat: -37.8136, lng: 144.9631, name: 'Melbourne', country: 'Australia' },
  auckland: { lat: -36.8485, lng: 174.7633, name: 'Auckland', country: 'New Zealand' },
};

// Realistic issue descriptions by category with city-specific context
const getRealisticDescription = (category: IssueCategory, cityName: string): string => {
  const descriptions: Record<IssueCategory, string[]> = {
    water: [
      `Water main leak causing street flooding near ${cityName} downtown area`,
      'Low water pressure affecting multiple residential blocks',
      'Sewage overflow detected in storm drain system',
      'Fire hydrant damaged and leaking continuously',
      'Brown discolored water coming from taps in neighborhood',
      'Underground pipe burst causing water to seep through pavement',
      'Blocked drainage causing flooding during rain',
      'Public water fountain not working for over a week',
      'Water meter damaged and showing incorrect readings',
      'Contaminated water reported from old pipeline infrastructure',
    ],
    roads: [
      `Large pothole on main avenue causing traffic hazards`,
      'Road surface cracking extensively after recent construction',
      'Missing manhole cover creating dangerous gap',
      'Severe road damage from heavy vehicle traffic',
      'Unmarked road construction causing confusion',
      'Pavement sinking near bus stop area',
      'Speed bumps worn down and ineffective',
      'Road markings faded and barely visible',
      'Broken curb creating pedestrian hazard',
      `Bridge expansion joints deteriorating in ${cityName} central district`,
    ],
    garbage: [
      'Overflowing dumpsters attracting pests and rodents',
      'Illegal dumping site growing larger daily',
      `Missed garbage collection for over two weeks in residential area`,
      'Broken public trash bins spilling waste',
      'Construction debris left unattended on sidewalk',
      'Medical waste improperly disposed near hospital',
      'Recycling bins not being separated properly',
      'Dead animal carcass on roadside for days',
      'Food waste attracting stray animals to commercial area',
      'Industrial waste illegally dumped near water source',
    ],
    traffic: [
      `Traffic signal malfunction at busy ${cityName} intersection`,
      'Stop sign knocked down and not replaced',
      'Pedestrian crossing signal not working',
      'Traffic congestion due to poor road design',
      'No speed limit signs in school zone',
      'Illegal parking blocking traffic flow',
      'Missing yield sign at dangerous merge point',
      'Traffic camera not functioning for months',
      'Bus lane being used by private vehicles',
      'Bike lane blocked by construction equipment',
    ],
    lighting: [
      'Multiple street lights out on residential street',
      'Flickering lamp post creating safety concern',
      `Dark alleyway near ${cityName} metro station`,
      'Park pathway completely unlit at night',
      'Broken traffic light causing accidents',
      'Parking garage lights not functioning',
      'Underpass lighting damaged and hazardous',
      'School crossing area poorly illuminated',
      'Bus stop lamp broken for weeks',
      'Commercial district street lights outdated',
    ],
    safety: [
      'Exposed electrical wiring on utility pole',
      `Unstable building facade on ${cityName} historic street`,
      'Broken playground equipment with sharp edges',
      'Abandoned vehicle blocking emergency access',
      'Open construction site without proper barriers',
      'Graffiti and vandalism increasing in area',
      'Suspicious activity reported near school',
      'Missing guardrail on elevated walkway',
      'Fire escape blocked with stored materials',
      'Emergency exit signs not illuminated in building',
    ],
    other: [
      'Noise pollution from late-night construction',
      `Air quality concerns near ${cityName} industrial zone`,
      'Abandoned shopping carts blocking sidewalk',
      'Broken bench in public park',
      'Public toilet facility out of order',
      'WiFi hotspot in public area not working',
      'Missing street name signs at intersection',
      'Overgrown vegetation blocking visibility',
      'Bird infestation on public building',
      'Public phone booth vandalized and non-functional',
    ],
  };

  const categoryDescriptions = descriptions[category];
  return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
};

// Generate issues with density based on city population/development
const getCityDensity = (cityName: string): number => {
  const highDensityCities = ['New Delhi', 'Mumbai', 'Tokyo', 'Shanghai', 'Beijing', 'Mexico City', 'São Paulo', 'Lagos', 'Jakarta', 'Cairo'];
  const mediumDensityCities = ['New York', 'London', 'Paris', 'Los Angeles', 'Moscow', 'Istanbul', 'Bangkok', 'Manila', 'Seoul'];
  
  if (highDensityCities.includes(cityName)) return Math.floor(Math.random() * 30) + 40; // 40-70 issues
  if (mediumDensityCities.includes(cityName)) return Math.floor(Math.random() * 20) + 25; // 25-45 issues
  return Math.floor(Math.random() * 15) + 10; // 10-25 issues for smaller cities
};

const generateWorldwideMockIssues = (): Issue[] => {
  const issues: Issue[] = [];
  let id = 1;

  Object.values(WORLD_CITIES).forEach((city) => {
    const issueCount = getCityDensity(city.name);
    
    for (let i = 0; i < issueCount; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const reportCount = Math.floor(Math.random() * 50) + 1;
      const daysAgo = Math.floor(Math.random() * 120);
      
      // Spread issues around city center with realistic distribution
      const spreadFactor = 0.05 + Math.random() * 0.05; // 0.05-0.10 degrees
      
      issues.push({
        id: `mock-${id++}`,
        category,
        description: getRealisticDescription(category, city.name),
        lat: city.lat + (Math.random() - 0.5) * spreadFactor * 2,
        lng: city.lng + (Math.random() - 0.5) * spreadFactor * 2,
        reportCount,
        lastUpdated: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - (daysAgo + Math.floor(Math.random() * 60)) * 24 * 60 * 60 * 1000),
        resolved: Math.random() > 0.85,
        resolutionConfirmations: Math.random() > 0.9 ? Math.floor(Math.random() * 5) : 0,
        severity: calculateSeverity(reportCount, category),
      });
    }
  });

  // Add additional random issues in suburban areas of major cities
  const majorCities = ['newDelhi', 'newYork', 'london', 'tokyo', 'saoPaulo', 'cairo', 'lagos', 'shanghai'];
  majorCities.forEach((cityKey) => {
    const city = WORLD_CITIES[cityKey as keyof typeof WORLD_CITIES];
    const suburbanIssues = Math.floor(Math.random() * 15) + 10;
    
    for (let i = 0; i < suburbanIssues; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const reportCount = Math.floor(Math.random() * 30) + 1;
      const daysAgo = Math.floor(Math.random() * 90);
      
      issues.push({
        id: `mock-suburb-${id++}`,
        category,
        description: getRealisticDescription(category, city.name),
        lat: city.lat + (Math.random() - 0.5) * 0.3,
        lng: city.lng + (Math.random() - 0.5) * 0.3,
        reportCount,
        lastUpdated: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - (daysAgo + Math.floor(Math.random() * 45)) * 24 * 60 * 60 * 1000),
        resolved: Math.random() > 0.82,
        resolutionConfirmations: 0,
        severity: calculateSeverity(reportCount, category),
      });
    }
  });

  return issues;
};

export const worldwideMockIssues = generateWorldwideMockIssues();
