import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Layers, MapPin, Info } from 'lucide-react';
interface HeaderProps {
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
}
const Header = ({
  showHeatmap,
  onToggleHeatmap
}: HeaderProps) => {
  return <motion.header initial={{
    y: -20,
    opacity: 0
  }} animate={{
    y: 0,
    opacity: 1
  }} className="bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
            <MapPin className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Civic-Sense</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Civic Intelligence Platform
            </p>
          </div>
        </div>

        {/* Tagline */}
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="w-4 h-4" />
          <span className="italic">"A problem well stated is half solved"</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant={showHeatmap ? 'default' : 'outline'} size="sm" onClick={onToggleHeatmap} className="gap-2">
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">
              {showHeatmap ? 'Heatmap' : 'Markers'}
            </span>
          </Button>
        </div>
      </div>
    </motion.header>;
};
export default Header;