import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, IssueCategory } from '@/types/issues';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, MapPin, Send } from 'lucide-react';

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

  const handleSubmit = async () => {
    if (!category || !description.trim() || !selectedLocation) return;

    setIsSubmitting(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSubmit({
      category,
      description: description.trim(),
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      lastUpdated: new Date(),
    });

    // Reset form
    setCategory(null);
    setDescription('');
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    setCategory(null);
    setDescription('');
    onClose();
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
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-card rounded-2xl shadow-2xl overflow-hidden mx-4">
              {/* Header */}
              <div className="bg-primary p-4 text-primary-foreground relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="absolute top-2 right-2 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <X className="w-5 h-5" />
                </Button>
                <h2 className="text-lg font-semibold">Report an Issue</h2>
                <p className="text-primary-foreground/80 text-sm mt-1">
                  Help improve your community
                </p>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Location */}
                {selectedLocation && (
                  <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-mono text-xs text-foreground">
                      {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
                    </span>
                  </div>
                )}

                {/* Category Selection */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Category *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => (
                      <motion.button
                        key={cat.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCategory(cat.id)}
                        className={`
                          flex items-center gap-2 p-3 rounded-lg border text-left transition-all
                          ${
                            category === cat.id
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-border bg-card hover:bg-muted/50 text-foreground'
                          }
                        `}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-xs font-medium">{cat.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Description *
                  </label>
                  <Textarea
                    placeholder="Describe the issue briefly..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {description.length}/200 characters
                  </p>
                </div>

                {/* Note about merging */}
                <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                  💡 If a similar issue exists nearby, your report will be merged to increase its visibility.
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!category || !description.trim() || isSubmitting}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubmitIssueModal;
