import { useState, useCallback, useMemo, useEffect } from 'react';
import { Issue, IssueCategory } from '@/types/issues';
import { subscribeToIssues, addIssueToFirestore, markIssueResolved, incrementReportCount } from '@/services/issueService';

export const useIssues = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<IssueCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = subscribeToIssues((updatedIssues) => {
      setIssues(updatedIssues);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const filteredIssues = useMemo(() => {
    if (selectedCategories.length === 0) {
      return issues.filter(issue => !issue.resolved);
    }
    return issues.filter(
      issue => selectedCategories.includes(issue.category) && !issue.resolved
    );
  }, [issues, selectedCategories]);

  const toggleCategory = useCallback((category: IssueCategory) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      }
      return [...prev, category];
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  const addIssue = useCallback(async (newIssue: Omit<Issue, 'id' | 'reportCount' | 'severity' | 'resolved' | 'resolutionConfirmations' | 'createdAt'>) => {
    try {
      await addIssueToFirestore(newIssue, issues);
    } catch (err) {
      console.error('Error adding issue:', err);
      setError('Failed to add issue. Please try again.');
    }
  }, [issues]);

  const markResolved = useCallback(async (issueId: string) => {
    try {
      const issue = issues.find(i => i.id === issueId);
      if (issue) {
        await markIssueResolved(issueId, issue.resolutionConfirmations, issue.reportCount);
      }
    } catch (err) {
      console.error('Error marking issue as resolved:', err);
      setError('Failed to mark issue as resolved. Please try again.');
    }
  }, [issues]);

  const reportSameIssue = useCallback(async (issueId: string) => {
    try {
      const issue = issues.find(i => i.id === issueId);
      if (issue) {
        await incrementReportCount(issueId, issue.reportCount, issue.category);
      }
    } catch (err) {
      console.error('Error reporting same issue:', err);
      setError('Failed to report issue. Please try again.');
    }
  }, [issues]);

  const stats = useMemo(() => {
    const activeIssues = issues.filter(i => !i.resolved);
    const resolvedIssues = issues.filter(i => i.resolved);
    const totalReports = issues.reduce((sum, i) => sum + i.reportCount, 0);
    const avgSeverity = activeIssues.length > 0 
      ? activeIssues.reduce((sum, i) => sum + i.severity, 0) / activeIssues.length 
      : 0;

    return {
      totalIssues: issues.length,
      activeIssues: activeIssues.length,
      resolvedIssues: resolvedIssues.length,
      totalReports,
      avgSeverity: Math.round(avgSeverity * 10) / 10,
    };
  }, [issues]);

  return {
    issues,
    filteredIssues,
    selectedCategories,
    toggleCategory,
    clearFilters,
    addIssue,
    markResolved,
    reportSameIssue,
    stats,
    loading,
    error,
  };
};
