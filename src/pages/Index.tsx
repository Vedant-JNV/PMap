import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import CivicMap from '@/components/Map/CivicMap';
import '@/components/Map/MapStyles.css';
import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';
import StatsBar from '@/components/StatsBar';
import IssuePanel from '@/components/IssuePanel';
import SubmitIssueModal from '@/components/SubmitIssueModal';
import DraggablePanel from '@/components/DraggablePanel';
import HeatmapLegend from '@/components/HeatmapLegend';
import { Button } from '@/components/ui/button';
import { useIssues } from '@/hooks/useIssues';
import { Issue, IssueCategory } from '@/types/issues';

const Index = () => {
  const {
    filteredIssues,
    selectedCategories,
    toggleCategory,
    clearFilters,
    addIssue,
    markResolved,
    stats,
  } = useIssues();

  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const constraintsRef = useRef<HTMLDivElement>(null);

  const handleIssueClick = useCallback((issue: Issue) => {
    setSelectedIssue(issue);
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setShowSubmitModal(true);
  }, []);

  const handleSubmitIssue = useCallback((data: {
    category: IssueCategory;
    description: string;
    lat: number;
    lng: number;
    lastUpdated: Date;
  }) => {
    addIssue(data);
    setSelectedLocation(null);
  }, [addIssue]);

  const handleCloseSubmitModal = useCallback(() => {
    setShowSubmitModal(false);
    setSelectedLocation(null);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <Header
        showHeatmap={showHeatmap}
        onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
      />

      {/* Main content */}
      <div className="flex-1 relative" ref={constraintsRef}>
        {/* Map */}
        <CivicMap
          issues={filteredIssues}
          showHeatmap={showHeatmap}
          onIssueClick={handleIssueClick}
          onMapClick={handleMapClick}
        />

        {/* Overlay Controls */}
        <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
          <div className="max-w-screen-xl mx-auto flex flex-col gap-4 items-start">
            {/* Stats Bar */}
            {showStats && (
              <div className="pointer-events-auto">
                <DraggablePanel 
                  title="Stats" 
                  onClose={() => setShowStats(false)}
                  constraintsRef={constraintsRef}
                >
                  <StatsBar stats={stats} />
                </DraggablePanel>
              </div>
            )}

            {/* Category Filter */}
            {showFilters && (
              <div className="pointer-events-auto">
                <DraggablePanel 
                  title="Filters" 
                  onClose={() => setShowFilters(false)}
                  constraintsRef={constraintsRef}
                >
                  <CategoryFilter
                    selectedCategories={selectedCategories}
                    onToggleCategory={toggleCategory}
                    onClearFilters={clearFilters}
                  />
                </DraggablePanel>
              </div>
            )}

            {/* Restore buttons when panels are hidden */}
            {(!showStats || !showFilters) && (
              <div className="pointer-events-auto flex gap-2 flex-wrap">
                {!showStats && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowStats(true)}
                    className="bg-card/95 backdrop-blur-sm shadow-lg"
                  >
                    Show Stats
                  </Button>
                )}
                {!showFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(true)}
                    className="bg-card/95 backdrop-blur-sm shadow-lg"
                  >
                    Show Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Click hint */}
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="bg-card/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-border text-sm text-muted-foreground flex items-center gap-2">
              📍 Click anywhere on the map to report an issue
              <button
                onClick={() => setShowHint(false)}
                className="ml-1 text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}

        {/* Heatmap Legend */}
        <HeatmapLegend visible={showHeatmap} />

        {/* Mobile FAB for adding issues */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="absolute bottom-20 right-4 z-10 sm:hidden"
        >
          <Button
            size="lg"
            onClick={() => {
              // Use current map center as default location
              setSelectedLocation({ lat: 37.7749, lng: -122.4194 });
              setShowSubmitModal(true);
            }}
            className="rounded-full w-14 h-14 shadow-xl"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>
      </div>

      {/* Issue Detail Panel */}
      {selectedIssue && (
        <IssuePanel
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onMarkResolved={markResolved}
        />
      )}

      {/* Submit Issue Modal */}
      <SubmitIssueModal
        isOpen={showSubmitModal}
        onClose={handleCloseSubmitModal}
        onSubmit={handleSubmitIssue}
        selectedLocation={selectedLocation}
      />
    </div>
  );
};

export default Index;
