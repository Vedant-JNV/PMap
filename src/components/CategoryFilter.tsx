import { motion } from 'framer-motion';
import { CATEGORIES, IssueCategory } from '@/types/issues';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategories: IssueCategory[];
  onToggleCategory: (category: IssueCategory) => void;
  onClearFilters: () => void;
}

const CategoryFilter = ({
  selectedCategories,
  onToggleCategory,
  onClearFilters,
}: CategoryFilterProps) => {
  return (
    <div className="bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Filter by Category</h3>
        {selectedCategories.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          return (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onToggleCategory(category.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                transition-all duration-200 border
                ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : selectedCategories.length === 0
                    ? 'bg-secondary/80 text-secondary-foreground border-transparent hover:bg-secondary'
                    : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
                }
              `}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
