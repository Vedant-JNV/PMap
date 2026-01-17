import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Issue, IssueCategory, calculateSeverity, getDistance, MERGE_RADIUS } from '@/types/issues';

const ISSUES_COLLECTION = 'issues';

// Convert Firestore document to Issue
const docToIssue = (doc: any): Issue => {
  const data = doc.data();
  return {
    id: doc.id,
    category: data.category,
    description: data.description,
    lat: data.lat,
    lng: data.lng,
    reportCount: data.reportCount,
    lastUpdated: data.lastUpdated?.toDate() || new Date(),
    createdAt: data.createdAt?.toDate() || new Date(),
    imageUrl: data.imageUrl,
    resolved: data.resolved,
    resolutionConfirmations: data.resolutionConfirmations,
    severity: data.severity,
  };
};

// Convert Issue to Firestore document
const issueToDoc = (issue: Omit<Issue, 'id'>) => ({
  category: issue.category,
  description: issue.description,
  lat: issue.lat,
  lng: issue.lng,
  reportCount: issue.reportCount,
  lastUpdated: Timestamp.fromDate(issue.lastUpdated instanceof Date ? issue.lastUpdated : new Date(issue.lastUpdated)),
  createdAt: Timestamp.fromDate(issue.createdAt instanceof Date ? issue.createdAt : new Date(issue.createdAt)),
  imageUrl: issue.imageUrl || null,
  resolved: issue.resolved,
  resolutionConfirmations: issue.resolutionConfirmations,
  severity: issue.severity,
});

// Subscribe to real-time updates
export const subscribeToIssues = (callback: (issues: Issue[]) => void) => {
  const q = query(
    collection(db, ISSUES_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const issues = snapshot.docs.map(docToIssue);
    callback(issues);
  }, (error) => {
    console.error('Error subscribing to issues:', error);
  });
};

// Add a new issue or merge with existing
export const addIssueToFirestore = async (
  newIssue: Omit<Issue, 'id' | 'reportCount' | 'severity' | 'resolved' | 'resolutionConfirmations' | 'createdAt'>,
  existingIssues: Issue[]
): Promise<void> => {
  // Check for nearby issues of the same category
  const nearbyIssue = existingIssues.find(issue => 
    issue.category === newIssue.category &&
    !issue.resolved &&
    getDistance(issue.lat, issue.lng, newIssue.lat, newIssue.lng) <= MERGE_RADIUS
  );

  if (nearbyIssue) {
    // Merge with existing issue
    const newReportCount = nearbyIssue.reportCount + 1;
    const issueRef = doc(db, ISSUES_COLLECTION, nearbyIssue.id);
    await updateDoc(issueRef, {
      reportCount: newReportCount,
      lastUpdated: Timestamp.fromDate(new Date()),
      severity: calculateSeverity(newReportCount, nearbyIssue.category),
      description: newIssue.description || nearbyIssue.description,
    });
  } else {
    // Create new issue
    const createdIssue: Omit<Issue, 'id'> = {
      ...newIssue,
      reportCount: 1,
      severity: calculateSeverity(1, newIssue.category),
      resolved: false,
      resolutionConfirmations: 0,
      createdAt: new Date(),
      lastUpdated: newIssue.lastUpdated instanceof Date ? newIssue.lastUpdated : new Date(),
    };

    await addDoc(collection(db, ISSUES_COLLECTION), issueToDoc(createdIssue));
  }
};

// Increment report count for an existing issue
export const incrementReportCount = async (issueId: string, currentReportCount: number, category: IssueCategory): Promise<void> => {
  const issueRef = doc(db, ISSUES_COLLECTION, issueId);
  const newReportCount = currentReportCount + 1;
  
  await updateDoc(issueRef, {
    reportCount: newReportCount,
    lastUpdated: Timestamp.fromDate(new Date()),
    severity: calculateSeverity(newReportCount, category),
  });
};

// Mark issue as resolved (with confirmation system)
// For issues with 10+ reports, require 50% of total reports as confirmations
// For issues with fewer reports, require minimum 3 confirmations
export const markIssueResolved = async (issueId: string, currentConfirmations: number, reportCount: number): Promise<void> => {
  const issueRef = doc(db, ISSUES_COLLECTION, issueId);
  const newConfirmations = currentConfirmations + 1;
  
  // Calculate required confirmations: 50% of reports for 10+ reports, otherwise 3
  const requiredConfirmations = reportCount >= 10 
    ? Math.ceil(reportCount * 0.5) 
    : 3;
  
  if (newConfirmations >= requiredConfirmations) {
    await updateDoc(issueRef, {
      resolved: true,
      resolutionConfirmations: newConfirmations,
      lastUpdated: Timestamp.fromDate(new Date()),
    });
  } else {
    await updateDoc(issueRef, {
      resolutionConfirmations: newConfirmations,
      lastUpdated: Timestamp.fromDate(new Date()),
    });
  }
};

// Seed initial data (only if collection is empty)
export const seedInitialData = async (mockIssues: Issue[]): Promise<void> => {
  const batch = writeBatch(db);
  
  mockIssues.forEach((issue) => {
    const docRef = doc(collection(db, ISSUES_COLLECTION));
    batch.set(docRef, issueToDoc(issue));
  });

  await batch.commit();
  console.log(`Seeded ${mockIssues.length} issues to Firestore`);
};
