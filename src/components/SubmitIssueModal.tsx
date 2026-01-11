import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { CATEGORIES, IssueCategory } from '@/types/issues';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, MapPin, Send, CheckCircle2, Loader2, AlertCircle, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface SubmitIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    category: IssueCategory;
    description: string;
    lat: number;
    lng: number;
    lastUpdated: Date;
  }) => void;
  selectedLocation: { lat: number; lng: number } | null;
}

const SubmitIssueModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedLocation,
}: SubmitIssueModalProps) => {
  const [category, setCategory] = useState<IssueCategory | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'category' | 'details'>('category');
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCategory(null);
      setDescription('');
      setStep('category');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!category || !selectedLocation) {
      toast.error('Please select a category');
      return;
    }

    if (!description.trim()) {
      toast.error('Please add a description');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      onSubmit({
        category,
        description: description.trim(),
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        lastUpdated: new Date(),
      });

      toast.success('Issue reported successfully!', {
        description: 'Thank you for helping improve your community.',
        icon: <CheckCircle2 className="w-4 h-4 text-success" />,
      });

      onClose();
    } catch (error) {
      toast.error('Failed to submit issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySelect = (cat: IssueCategory) => {
    setCategory(cat);
    setStep('details');
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleBack = () => {
    setStep('category');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
            ref={constraintsRef}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0.1}
            dragConstraints={constraintsRef}
            className="fixed inset-0 flex items-center justify-center z-50 px-4 pointer-events-none"
          >
            <div className="bg-card rounded-2xl shadow-2xl overflow-hidden border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto">
              {/* Header - draggable */}
              <div 
                className="bg-gradient-to-r from-primary to-primary/80 p-5 text-primary-foreground relative cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <GripVertical className="w-4 h-4 text-primary-foreground/60" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Report an Issue</h2>
                    <p className="text-primary-foreground/80 text-sm">
                      Help improve your community
                    </p>
                  </div>
                </div>

                {/* Step indicator */}
                <div className="flex gap-2 mt-4">
                  <div className={`flex-1 h-1 rounded-full transition-colors ${step === 'category' ? 'bg-primary-foreground' : 'bg-primary-foreground/40'}`} />
                  <div className={`flex-1 h-1 rounded-full transition-colors ${step === 'details' ? 'bg-primary-foreground' : 'bg-primary-foreground/40'}`} />
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Location display */}
                {selectedLocation && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm bg-muted rounded-lg p-3 mb-4"
                  >
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-mono text-xs text-foreground">
                      {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
                    </span>
                  </motion.div>
                )}

                <AnimatePresence mode="wait">
                  {step === 'category' ? (
                    <motion.div
                      key="category-step"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <label className="text-sm font-semibold text-foreground mb-3 block">
                        What type of issue is this?
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {CATEGORIES.map((cat) => (
                          <motion.button
                            key={cat.id}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCategorySelect(cat.id)}
                            className="flex items-center gap-3 p-4 rounded-xl border-2 border-border bg-card hover:bg-muted/50 hover:border-primary/50 text-left transition-all group"
                          >
                            <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                            <span className="text-sm font-medium text-foreground">{cat.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="details-step"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      {/* Selected category display */}
                      {category && (
                        <div className="flex items-center justify-between bg-primary/10 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{CATEGORIES.find(c => c.id === category)?.icon}</span>
                            <span className="text-sm font-medium text-foreground">
                              {CATEGORIES.find(c => c.id === category)?.label}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            className="text-xs"
                          >
                            Change
                          </Button>
                        </div>
                      )}

                      {/* Description */}
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">
                          Describe the issue
                        </label>
                        <Textarea
                          placeholder="What's the problem? Be specific about the location and severity..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value.slice(0, 300))}
                          className="resize-none min-h-[120px] text-base"
                          autoFocus
                        />
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-muted-foreground">
                            Be specific to help others understand
                          </p>
                          <p className={`text-xs ${description.length > 250 ? 'text-warning' : 'text-muted-foreground'}`}>
                            {description.length}/300
                          </p>
                        </div>
                      </div>

                      {/* Info box */}
                      <div className="bg-muted/50 rounded-xl p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p className="font-medium text-foreground">How merging works</p>
                          <p>If a similar issue exists nearby, your report will be merged to increase its visibility and priority.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-border bg-muted/30">
                <div className="flex gap-3">
                  {step === 'details' && (
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      Back
                    </Button>
                  )}
                  {step === 'category' ? (
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={!category || !description.trim() || isSubmitting}
                      className="flex-1 gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Report
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubmitIssueModal;
