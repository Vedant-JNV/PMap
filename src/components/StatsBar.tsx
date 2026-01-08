import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Users, TrendingUp } from 'lucide-react';

interface StatsBarProps {
  stats: {
    totalIssues: number;
    activeIssues: number;
    resolvedIssues: number;
    totalReports: number;
    avgSeverity: number;
  };
}

const StatsBar = ({ stats }: StatsBarProps) => {
  const statItems = [
    {
      label: 'Active Issues',
      value: stats.activeIssues,
      icon: AlertTriangle,
      color: 'text-warning',
    },
    {
      label: 'Resolved',
      value: stats.resolvedIssues,
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      label: 'Total Reports',
      value: stats.totalReports,
      icon: Users,
      color: 'text-primary',
    },
    {
      label: 'Avg Severity',
      value: stats.avgSeverity,
      icon: TrendingUp,
      color: 'text-destructive',
    },
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-card/95 backdrop-blur-sm rounded-xl shadow-lg border border-border"
    >
      <div className="grid grid-cols-4 divide-x divide-border">
        {statItems.map((item, index) => (
          <div key={item.label} className="p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <span className="text-xs text-muted-foreground hidden sm:inline">{item.label}</span>
            </div>
            <p className="text-lg font-bold text-foreground">{item.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default StatsBar;
