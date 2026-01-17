import { motion, AnimatePresence } from 'framer-motion';
import { Issue, getCategoryInfo } from '@/types/issues';
import { Button } from '@/components/ui/button';
import { X, Clock, Users, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface IssuePanelProps {
  issue: Issue | null;
  onClose: () => void;
  onMarkResolved: (issueId: string) => void;
  onReportSame: (issueId: string) => void;
}

const IssuePanel = ({ issue, onClose, onMarkResolved, onReportSame }: IssuePanelProps) => {
  if (!issue) return null;

  const categoryInfo = getCategoryInfo(issue.category);
  
  // Calculate required confirmations based on report count
  const requiredConfirmations = issue.reportCount >= 10 
    ? Math.ceil(issue.reportCount * 0.5) 
    : 3;
  const confirmationsNeeded = requiredConfirmations - issue.resolutionConfirmations;

  const handleReportSame = () => {
    onReportSame(issue.id);
    toast({
      title: "Thank you for reporting!",
      description: "Your report helps the community identify and prioritize issues.",
    });
  };

  const handleMarkResolved = () => {
    onMarkResolved(issue.id);
    toast({
      title: "Thank you for confirming!",
      description: "Your confirmation helps verify resolved issues.",
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full sm:w-96 bg-card shadow-2xl z-50 overflow-hidden"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div
            className="p-4 text-white relative"
            style={{ backgroundColor: categoryInfo.color }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{categoryInfo.icon}</span>
              <div>
                <h2 className="font-semibold text-lg">{categoryInfo.label}</h2>
                <p className="text-white/80 text-sm">Issue #{issue.id.slice(-6)}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Description */}
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-foreground">{issue.description}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">Reports</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{issue.reportCount}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Severity</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{issue.severity}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last updated</span>
                <span className="font-medium text-foreground">
                  {formatDistanceToNow(issue.lastUpdated, { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">First reported</span>
                <span className="font-medium text-foreground">
                  {formatDistanceToNow(issue.createdAt, { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Resolution Status */}
            {issue.resolutionConfirmations > 0 && (
              <div className="bg-success/10 border border-success/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Resolution in progress</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {issue.resolutionConfirmations} of {requiredConfirmations} confirmations received
                </p>
              </div>
            )}

            {/* Location */}
            <div className="text-xs text-muted-foreground">
              📍 {issue.lat.toFixed(5)}, {issue.lng.toFixed(5)}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border space-y-3">
            <Button
              onClick={handleReportSame}
              variant="destructive"
              className="w-full"
              disabled={issue.resolved}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report Same Issue
            </Button>
            <Button
              onClick={handleMarkResolved}
              variant="success"
              className="w-full"
              disabled={issue.resolved}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {issue.resolved
                ? 'Resolved'
                : confirmationsNeeded > 0
                ? `Confirm Resolution (${confirmationsNeeded} more needed)`
                : 'Mark as Resolved'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Community verification requires {requiredConfirmations} confirmations
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IssuePanel;
