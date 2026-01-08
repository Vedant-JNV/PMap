import { useState, useCallback, useMemo } from 'react';
import { Issue, IssueCategory, calculateSeverity, getDistance, MERGE_RADIUS } from '@/types/issues';
import { mockIssues } from '@/data/mockIssues';

export const useIssues = () => {
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [selectedCategories, setSelectedCategories] = useState<IssueCategory[]>([]);

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

  const addIssue = useCallback((newIssue: Omit<Issue, 'id' | 'reportCount' | 'severity' | 'resolved' | 'resolutionConfirmations' | 'createdAt'>) => {
    setIssues(prev => {
      // Check for nearby issues of the same category
      const nearbyIssue = prev.find(issue => 
        issue.category === newIssue.category &&
        !issue.resolved &&
        getDistance(issue.lat, issue.lng, newIssue.lat, newIssue.lng) <= MERGE_RADIUS
      );

      if (nearbyIssue) {
        // Merge with existing issue
        return prev.map(issue => {
          if (issue.id === nearbyIssue.id) {
            const newReportCount = issue.reportCount + 1;
            return {
              ...issue,
              reportCount: newReportCount,
              lastUpdated: new Date(),
              severity: calculateSeverity(newReportCount, issue.category),
              description: newIssue.description || issue.description,
            };
          }
          return issue;
        });
      }

      // Create new issue
      const id = `issue-${Date.now()}`;
      const createdIssue: Issue = {
        id,
        ...newIssue,
        reportCount: 1,
        severity: calculateSeverity(1, newIssue.category),
        resolved: false,
        resolutionConfirmations: 0,
        createdAt: new Date(),
      };

      return [...prev, createdIssue];
    });
  }, []);

  const markResolved = useCallback((issueId: string) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        const newConfirmations = issue.resolutionConfirmations + 1;
        // Require 3 confirmations to mark as resolved
        if (newConfirmations >= 3) {
          return {
            ...issue,
            resolved: true,
            resolutionConfirmations: newConfirmations,
            lastUpdated: new Date(),
          };
        }
        return {
          ...issue,
          resolutionConfirmations: newConfirmations,
          lastUpdated: new Date(),
        };
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
  };
};
