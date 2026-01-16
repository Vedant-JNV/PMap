import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Layers, Info, Globe, Database } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logo from '@/assets/logo.jpeg';

interface HeaderProps {
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  isMockMode: boolean;
  onToggleMockMode: () => void;
}

const Header = ({
  showHeatmap,
  onToggleHeatmap,
  isMockMode,
  onToggleMockMode,
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

        {/* Mode Indicator */}
        {isMockMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full"
          >
            <Globe className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Demo Mode - Worldwide Mock Data
            </span>
          </motion.div>
        )}

        {/* Tagline - only show when not in mock mode */}
        {!isMockMode && (
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4" />
            <span className="italic">"A problem well stated is a problem half solved"</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Data Source Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {isMockMode ? (
                  <>
                    <Globe className="w-4 h-4 text-amber-500" />
                    <span className="hidden sm:inline">Demo</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 text-green-500" />
                    <span className="hidden sm:inline">Live</span>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => !isMockMode && onToggleMockMode()}
                className="gap-2"
              >
                <Globe className="w-4 h-4 text-amber-500" />
                <div className="flex flex-col">
                  <span className="font-medium">Demo Mode</span>
                  <span className="text-xs text-muted-foreground">
                    Worldwide mock data (no sync)
                  </span>
                </div>
                {isMockMode && <span className="ml-auto text-green-500">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => isMockMode && onToggleMockMode()}
                className="gap-2"
              >
                <Database className="w-4 h-4 text-green-500" />
                <div className="flex flex-col">
                  <span className="font-medium">Live Mode</span>
                  <span className="text-xs text-muted-foreground">
                    Real data synced to cloud
                  </span>
                </div>
                {!isMockMode && <span className="ml-auto text-green-500">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Toggle */}
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
