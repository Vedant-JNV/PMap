import { useState, useRef } from 'react';
import { motion, useDragControls, AnimatePresence } from 'framer-motion';
import { Minus, X, GripVertical, ChevronUp, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DraggablePanelProps {
  children: React.ReactNode;
  title?: string;
  onClose?: () => void;
  className?: string;
  defaultMinimized?: boolean;
  constraintsRef?: React.RefObject<HTMLElement>;
}

const DraggablePanel = ({
  children,
  title,
  onClose,
  className = '',
  defaultMinimized = false,
  constraintsRef,
}: DraggablePanelProps) => {
  const [isMinimized, setIsMinimized] = useState(defaultMinimized);
  const [isVisible, setIsVisible] = useState(true);
  const dragControls = useDragControls();
  const panelRef = useRef<HTMLDivElement>(null);

  if (!isVisible) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="inline-block"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-card/95 backdrop-blur-sm shadow-lg gap-2"
        >
          <Maximize2 className="w-3 h-3" />
          {title || 'Show Panel'}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={panelRef}
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={constraintsRef || { left: -500, right: 500, top: -200, bottom: 400 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative cursor-default ${className}`}
      style={{ touchAction: 'none' }}
    >
      {/* Drag Handle & Controls */}
      <div 
        className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-muted/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-md cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <GripVertical className="w-3 h-3 text-muted-foreground" />
        {title && (
          <span className="text-[10px] font-medium text-muted-foreground px-1 select-none">
            {title}
          </span>
        )}
        <div className="flex items-center gap-0.5 ml-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="p-0.5 rounded hover:bg-background/50 transition-colors"
          >
            <Minus className="w-3 h-3 text-muted-foreground" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
              onClose?.();
            }}
            className="p-0.5 rounded hover:bg-destructive/20 transition-colors"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isMinimized ? (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pt-2"
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="minimized"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-border mt-2"
          >
            <button 
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronUp className="w-3 h-3" />
              Expand {title || 'panel'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DraggablePanel;
