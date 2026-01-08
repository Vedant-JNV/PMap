import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface HeatmapLegendProps {
  visible: boolean;
}

const HeatmapLegend = ({ visible }: HeatmapLegendProps) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!visible) return null;

  const gradientColors = [
    { color: '#10b981', label: 'Low' },
    { color: '#22c55e', label: '' },
    { color: '#eab308', label: 'Medium' },
    { color: '#f97316', label: '' },
    { color: '#ef4444', label: 'High' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-20 left-4 z-20 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border overflow-hidden"
    >
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
      >
        <span>Severity Legend</span>
        {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-3 pb-3"
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-32 h-4 rounded-sm"
                style={{
                  background: `linear-gradient(to right, ${gradientColors.map(g => g.color).join(', ')})`
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1 w-32">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HeatmapLegend;
