import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, X, GripVertical, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CollapsiblePanelProps {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
  defaultMinimized?: boolean;
  showControls?: boolean;
  draggable?: boolean;
}

const CollapsiblePanel = ({
  children,
  onClose,
  className = '',
  defaultMinimized = false,
  showControls = true,
  draggable = false,
}: CollapsiblePanelProps) => {
  const [isMinimized, setIsMinimized] = useState(defaultMinimized);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="inline-block"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-card/95 backdrop-blur-sm shadow-lg"
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`relative ${className}`}
    >
      {showControls && (
        <div className="absolute -top-2 -right-2 z-10 flex items-center gap-0.5">
          {draggable && (
            <div className="p-1 rounded bg-muted/80 cursor-move">
              <GripVertical className="w-3 h-3 text-muted-foreground" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-6 h-6 rounded-full bg-muted/80 hover:bg-muted"
          >
            <Minus className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsVisible(false);
              onClose?.();
            }}
            className="w-6 h-6 rounded-full bg-muted/80 hover:bg-muted"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
      <AnimatePresence mode="wait">
        {!isMinimized ? (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="minimized"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg border border-border"
          >
            <span className="text-xs text-muted-foreground">Panel minimized</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CollapsiblePanel;
