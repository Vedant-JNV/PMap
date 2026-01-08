import { Issue, IssueCategory, calculateSeverity } from '@/types/issues';

// Major Indian cities with coordinates
const INDIAN_CITIES = {
  newDelhi: { lat: 28.6139, lng: 77.2090, name: 'New Delhi' },
  mumbai: { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
  bangalore: { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
  chennai: { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
  kolkata: { lat: 22.5726, lng: 88.3639, name: 'Kolkata' },
  hyderabad: { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' },
  pune: { lat: 18.5204, lng: 73.8567, name: 'Pune' },
  ahmedabad: { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad' },
  jaipur: { lat: 26.9124, lng: 75.7873, name: 'Jaipur' },
  lucknow: { lat: 26.8467, lng: 80.9462, name: 'Lucknow' },
  chandigarh: { lat: 30.7333, lng: 76.7794, name: 'Chandigarh' },
  bhopal: { lat: 23.2599, lng: 77.4126, name: 'Bhopal' },
  patna: { lat: 25.5941, lng: 85.1376, name: 'Patna' },
  surat: { lat: 21.1702, lng: 72.8311, name: 'Surat' },
  nagpur: { lat: 21.1458, lng: 79.0882, name: 'Nagpur' },
};

// Delhi localities/areas for dense data
const DELHI_HOTSPOTS = [
  { lat: 28.6280, lng: 77.2190, name: 'Connaught Place', density: 35 },
  { lat: 28.6562, lng: 77.2410, name: 'Chandni Chowk', density: 40 },
  { lat: 28.5535, lng: 77.2588, name: 'Saket', density: 25 },
  { lat: 28.5672, lng: 77.2100, name: 'Hauz Khas', density: 30 },
  { lat: 28.6448, lng: 77.2167, name: 'Karol Bagh', density: 35 },
  { lat: 28.6692, lng: 77.4538, name: 'Noida Sector 18', density: 25 },
  { lat: 28.4595, lng: 77.0266, name: 'Gurgaon', density: 30 },
  { lat: 28.7041, lng: 77.1025, name: 'Rohini', density: 28 },
  { lat: 28.5355, lng: 77.3910, name: 'Noida', density: 22 },
  { lat: 28.6129, lng: 77.2295, name: 'India Gate', density: 20 },
  { lat: 28.5921, lng: 77.0460, name: 'Dwarka', density: 25 },
  { lat: 28.6920, lng: 77.2150, name: 'Civil Lines', density: 18 },
  { lat: 28.6315, lng: 77.0870, name: 'Janakpuri', density: 20 },
  { lat: 28.5494, lng: 77.1840, name: 'Vasant Kunj', density: 18 },
  { lat: 28.6508, lng: 77.1855, name: 'Punjabi Bagh', density: 22 },
  { lat: 28.5245, lng: 77.1855, name: 'Mehrauli', density: 15 },
  { lat: 28.6830, lng: 77.3010, name: 'Shahdara', density: 20 },
  { lat: 28.6375, lng: 77.2750, name: 'Laxmi Nagar', density: 25 },
  { lat: 28.5620, lng: 77.2410, name: 'Nehru Place', density: 18 },
  { lat: 28.6358, lng: 77.2245, name: 'Rajiv Chowk', density: 22 },
];

const categories: IssueCategory[] = ['water', 'roads', 'garbage', 'traffic', 'lighting', 'safety'];

const getRandomDescription = (category: IssueCategory): string => {
  const descriptions: Record<IssueCategory, string[]> = {
    water: [
      'No water supply for 3 days',
      'Leaking water pipe flooding street',
      'Low water pressure in the area',
      'Contaminated water supply reported',
      'Fire hydrant broken and leaking',
      'Water tanker not arriving on schedule',
      'Sewage mixing with drinking water',
      'Broken hand pump needs repair',
      'Underground pipeline burst',
      'Water meter malfunctioning',
    ],
    roads: [
      'Large pothole causing accidents',
      'Road surface completely damaged',
      'Manhole cover missing',
      'Speed breaker too high',
      'Road needs resurfacing urgently',
      'Waterlogging on main road',
      'Broken divider causing accidents',
      'Road markings faded completely',
      'Footpath blocked by encroachment',
      'Under-construction road left incomplete',
    ],
    garbage: [
      'Garbage not collected for a week',
      'Open dumping near residential area',
      'Overflowing garbage bins',
      'Dead animal carcass on street',
      'Sewage overflow on road',
      'Burning garbage causing pollution',
      'Garbage dump attracting stray dogs',
      'No dustbins in the locality',
      'Drain blocked with garbage',
      'Construction debris dumped on road',
    ],
    traffic: [
      'Traffic signal not working',
      'Missing road signs',
      'Illegal parking blocking road',
      'No zebra crossing at busy junction',
      'Street congested during peak hours',
      'Auto rickshaw stand causing blockage',
      'Broken traffic signal',
      'One-way sign missing',
      'Heavy traffic due to construction',
      'School zone needs traffic control',
    ],
    lighting: [
      'Street lights not working',
      'Dark alley needs lighting',
      'Broken street lamp post',
      'Flickering street lights',
      'No lighting in park area',
      'Transformer sparking at night',
      'Entire colony without street lights',
      'High mast light not functioning',
      'Underground cable exposed',
      'Electric pole leaning dangerously',
    ],
    safety: [
      'Unsafe construction site',
      'Broken fence near school',
      'Open electrical wires',
      'Abandoned building attracting crime',
      'Missing guardrails on bridge',
      'Open drain without cover',
      'Stray dog menace in area',
      'Illegal liquor shop near school',
      'Dangerous tree about to fall',
      'Boundary wall collapsed',
    ],
  };

  const categoryDescriptions = descriptions[category];
  return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
};

const generateMockIssues = (): Issue[] => {
  const issues: Issue[] = [];
  let id = 1;

  // Generate 500+ issues in New Delhi
  DELHI_HOTSPOTS.forEach((hotspot) => {
    for (let i = 0; i < hotspot.density; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const reportCount = Math.floor(Math.random() * 25) + 1;
      const daysAgo = Math.floor(Math.random() * 60);

      issues.push({
        id: `issue-${id++}`,
        category,
        description: getRandomDescription(category),
        lat: hotspot.lat + (Math.random() - 0.5) * 0.015,
        lng: hotspot.lng + (Math.random() - 0.5) * 0.015,
        reportCount,
        lastUpdated: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - (daysAgo + Math.floor(Math.random() * 30)) * 24 * 60 * 60 * 1000),
        resolved: Math.random() > 0.88,
        resolutionConfirmations: Math.random() > 0.9 ? Math.floor(Math.random() * 3) : 0,
        severity: calculateSeverity(reportCount, category),
      });
    }
  });

  // Add scattered issues across Delhi NCR
  for (let i = 0; i < 80; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const reportCount = Math.floor(Math.random() * 15) + 1;
    const daysAgo = Math.floor(Math.random() * 90);

    issues.push({
      id: `issue-${id++}`,
      category,
      description: getRandomDescription(category),
      lat: INDIAN_CITIES.newDelhi.lat + (Math.random() - 0.5) * 0.25,
      lng: INDIAN_CITIES.newDelhi.lng + (Math.random() - 0.5) * 0.5,
      reportCount,
      lastUpdated: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - (daysAgo + Math.floor(Math.random() * 30)) * 24 * 60 * 60 * 1000),
      resolved: Math.random() > 0.85,
      resolutionConfirmations: 0,
      severity: calculateSeverity(reportCount, category),
    });
  }

  // Generate issues for other major Indian cities
  const otherCities = Object.entries(INDIAN_CITIES).filter(([key]) => key !== 'newDelhi');
  
  otherCities.forEach(([, city]) => {
    // 15-30 issues per city
    const cityIssueCount = Math.floor(Math.random() * 16) + 15;
    
    for (let i = 0; i < cityIssueCount; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const reportCount = Math.floor(Math.random() * 20) + 1;
      const daysAgo = Math.floor(Math.random() * 90);

      issues.push({
        id: `issue-${id++}`,
        category,
        description: getRandomDescription(category),
        lat: city.lat + (Math.random() - 0.5) * 0.08,
        lng: city.lng + (Math.random() - 0.5) * 0.08,
        reportCount,
        lastUpdated: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - (daysAgo + Math.floor(Math.random() * 30)) * 24 * 60 * 60 * 1000),
        resolved: Math.random() > 0.85,
        resolutionConfirmations: Math.random() > 0.9 ? Math.floor(Math.random() * 3) : 0,
        severity: calculateSeverity(reportCount, category),
      });
    }
  });

  return issues;
};

export const mockIssues = generateMockIssues();
