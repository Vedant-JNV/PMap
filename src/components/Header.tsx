import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Layers, Info } from 'lucide-react';
import logo from '@/assets/logo.jpeg';

interface HeaderProps {
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
}

const Header = ({
  showHeatmap,
  onToggleHeatmap
}: HeaderProps) => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-card/95 backdrop-blur-sm border-b border-border"
    >
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="VedMaps Logo" 
            className="w-10 h-10 rounded-xl shadow-md object-cover"
          />
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">VedMaps</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Making Our Problems Visible !
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
          <Button
            variant={showHeatmap ? 'default' : 'outline'}
            size="sm"
            onClick={onToggleHeatmap}
            className="gap-2"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">
              {showHeatmap ? 'Heatmap' : 'Markers'}
            </span>
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;