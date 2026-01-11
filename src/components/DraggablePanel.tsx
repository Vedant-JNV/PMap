import { useState, useRef } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, GripVertical, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DraggablePanelProps {
  children: React.ReactNode;
  title?: string;
  onClose?: () => void;
  className?: string;
  constraintsRef?: React.RefObject<HTMLElement>;
}

const DraggablePanel = ({
  children,
  title,
  onClose,
  className = '',
  constraintsRef,
}: DraggablePanelProps) => {
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
            onClose?.();
          }}
          className="p-0.5 rounded hover:bg-destructive/20 transition-colors ml-1"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>

      <div className="pt-2">
        {children}
      </div>
    </motion.div>
  );
};

export default DraggablePanel;
