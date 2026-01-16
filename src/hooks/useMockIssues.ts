import { useState, useCallback, useMemo } from 'react';
import { Issue, IssueCategory, calculateSeverity, getDistance, MERGE_RADIUS } from '@/types/issues';
import { worldwideMockIssues } from '@/data/worldwideMockIssues';

export const useMockIssues = () => {
  const [issues, setIssues] = useState<Issue[]>(worldwideMockIssues);
  const [selectedCategories, setSelectedCategories] = useState<IssueCategory[]>([]);
  const loading = false;
  const error = null;

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

  // Mock add issue - only updates local state, no Firebase
  const addIssue = useCallback((newIssue: Omit<Issue, 'id' | 'reportCount' | 'severity' | 'resolved' | 'resolutionConfirmations' | 'createdAt'>) => {
    // Check for nearby existing issues to merge
    const nearbyIssue = issues.find(existing => 
      existing.category === newIssue.category &&
      !existing.resolved &&
      getDistance(existing.lat, existing.lng, newIssue.lat, newIssue.lng) <= MERGE_RADIUS
    );

    if (nearbyIssue) {
      // Merge with existing issue
      setIssues(prev => prev.map(issue => {
        if (issue.id === nearbyIssue.id) {
          const newReportCount = issue.reportCount + 1;
          return {
            ...issue,
            reportCount: newReportCount,
            lastUpdated: new Date(),
            severity: calculateSeverity(newReportCount, issue.category),
            description: issue.description, // Keep original description
          };
        }
        return issue;
      }));
    } else {
      // Create new issue
      const issue: Issue = {
        id: `mock-new-${Date.now()}`,
        category: newIssue.category,
        description: newIssue.description,
        lat: newIssue.lat,
        lng: newIssue.lng,
        reportCount: 1,
        lastUpdated: new Date(),
        createdAt: new Date(),
        imageUrl: newIssue.imageUrl,
        resolved: false,
        resolutionConfirmations: 0,
        severity: calculateSeverity(1, newIssue.category),
      };
      setIssues(prev => [...prev, issue]);
    }
  }, [issues]);

  // Mock mark resolved - only updates local state
  const markResolved = useCallback((issueId: string) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        const newConfirmations = issue.resolutionConfirmations + 1;
        if (newConfirmations >= 3) {
          return { ...issue, resolved: true, resolutionConfirmations: newConfirmations };
        }
        return { ...issue, resolutionConfirmations: newConfirmations };
      }
      return issue;
    }));
  }, []);

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
    stats,
    loading,
    error,
  };
};
