import { Issue, IssueCategory, calculateSeverity } from '@/types/issues';

// Mock data centered around a default city location (San Francisco as example)
const generateMockIssues = (): Issue[] => {
  const baseCoords = { lat: 37.7749, lng: -122.4194 };
  const categories: IssueCategory[] = ['water', 'roads', 'garbage', 'traffic', 'lighting', 'safety'];
  
  const issues: Issue[] = [];
  
  // Generate clustered issues for hotspots
  const hotspots = [
    { lat: baseCoords.lat + 0.01, lng: baseCoords.lng - 0.02, density: 8 },
    { lat: baseCoords.lat - 0.015, lng: baseCoords.lng + 0.01, density: 12 },
    { lat: baseCoords.lat + 0.025, lng: baseCoords.lng + 0.015, density: 6 },
    { lat: baseCoords.lat - 0.008, lng: baseCoords.lng - 0.025, density: 10 },
    { lat: baseCoords.lat + 0.005, lng: baseCoords.lng + 0.03, density: 5 },
  ];

  let id = 1;
  
  hotspots.forEach((hotspot, hotspotIndex) => {
    for (let i = 0; i < hotspot.density; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const reportCount = Math.floor(Math.random() * 20) + 1;
      const daysAgo = Math.floor(Math.random() * 30);
      
      const issue: Issue = {
        id: `issue-${id++}`,
        category,
        description: getRandomDescription(category),
        lat: hotspot.lat + (Math.random() - 0.5) * 0.008,
        lng: hotspot.lng + (Math.random() - 0.5) * 0.008,
        reportCount,
        lastUpdated: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - (daysAgo + Math.floor(Math.random() * 30)) * 24 * 60 * 60 * 1000),
        resolved: Math.random() > 0.85,
        resolutionConfirmations: Math.random() > 0.9 ? Math.floor(Math.random() * 3) : 0,
        severity: calculateSeverity(reportCount, category),
      };
      
      issues.push(issue);
    }
  });

  // Add some scattered issues
  for (let i = 0; i < 15; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const reportCount = Math.floor(Math.random() * 8) + 1;
    const daysAgo = Math.floor(Math.random() * 60);
    
    const issue: Issue = {
      id: `issue-${id++}`,
      category,
      description: getRandomDescription(category),
      lat: baseCoords.lat + (Math.random() - 0.5) * 0.06,
      lng: baseCoords.lng + (Math.random() - 0.5) * 0.06,
      reportCount,
      lastUpdated: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - (daysAgo + Math.floor(Math.random() * 30)) * 24 * 60 * 60 * 1000),
      resolved: Math.random() > 0.9,
      resolutionConfirmations: 0,
      severity: calculateSeverity(reportCount, category),
    };
    
    issues.push(issue);
  }

  return issues;
};

const getRandomDescription = (category: IssueCategory): string => {
  const descriptions: Record<IssueCategory, string[]> = {
    water: [
      'No water supply for 3 days',
      'Leaking water pipe flooding street',
      'Low water pressure in the area',
      'Contaminated water supply reported',
      'Fire hydrant broken and leaking',
    ],
    roads: [
      'Large pothole causing accidents',
      'Road surface completely damaged',
      'Manhole cover missing',
      'Speed breaker too high',
      'Road needs resurfacing urgently',
    ],
    garbage: [
      'Garbage not collected for a week',
      'Open dumping near residential area',
      'Overflowing garbage bins',
      'Dead animal carcass on street',
      'Sewage overflow on road',
    ],
    traffic: [
      'Traffic signal not working',
      'Missing road signs',
      'Illegal parking blocking road',
      'No zebra crossing at busy junction',
      'Street congested during peak hours',
    ],
    lighting: [
      'Street lights not working',
      'Dark alley needs lighting',
      'Broken street lamp post',
      'Flickering street lights',
      'No lighting in park area',
    ],
    safety: [
      'Unsafe construction site',
      'Broken fence near school',
      'Open electrical wires',
      'Abandoned building attracting crime',
      'Missing guardrails on bridge',
    ],
  };

  const categoryDescriptions = descriptions[category];
  return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
};

export const mockIssues = generateMockIssues();
