'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageCard from './ImageCard';

interface GalleryItem {
  id: string | number;
  title: string;
  description?: string;
  image?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  season?: string;
  rating?: number;
  chef?: {
    name: string;
    avatar?: string;
  };
  tags?: string[];
  featured?: boolean;
}

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface GalleryGridProps {
  items: GalleryItem[];
  categories?: FilterOption[];
  seasons?: FilterOption[];
  difficulties?: FilterOption[];
  onItemClick?: (item: GalleryItem) => void;
  className?: string;
  /**
   * Layout mode (currently informational – future enhancement hook).
   * Renamed internally to avoid unused variable lint error.
   */
  layout?: 'grid' | 'masonry' | 'featured';
  columns?: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  showFilters?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  loading?: boolean;
  emptyState?: React.ReactNode;
}

export default function GalleryGrid({
  items,
  categories = [],
  seasons = [],
  difficulties = [],
  onItemClick,
  className = '',
  // layout prop accepted but not used yet (reserved for future variants)
  columns = { sm: 1, md: 2, lg: 3, xl: 3 },
  showFilters = true,
  searchable = true,
  sortable = true,
  loading = false,
  emptyState
}: GalleryGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeSeason, setActiveSeason] = useState<string>('all');
  const [activeDifficulty, setActiveDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'name' | 'difficulty'>('recent');

  // Filter and sort items
  const filteredItems = useMemo(() => {
    const filtered = items.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSeason = activeSeason === 'all' || item.season === activeSeason;
      const matchesDifficulty = activeDifficulty === 'all' || item.difficulty === activeDifficulty;
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSeason && matchesDifficulty && matchesSearch;
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return a.title.localeCompare(b.title);
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0) - 
                 (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0);
        default:
          return 0; // Recent - maintain original order
      }
    });

    // Featured items first
    return filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }, [items, activeCategory, activeSeason, activeDifficulty, searchQuery, sortBy]);

  const getColumnClasses = () => {
    return `grid grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg} xl:grid-cols-${columns.xl}`;
  };

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <div className="mb-8 space-y-6">
        {/* Search and Sort */}
        {(searchable || sortable) && (
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {searchable && (
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <svg 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search dishes, ingredients, or techniques..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            )}

            {sortable && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-stone-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recent' | 'rating' | 'name' | 'difficulty')}
                  className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent text-sm"
                >
                  <option value="recent">Most Recent</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="difficulty">Difficulty</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Category Filters */}
        {categories.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-stone-700 mb-3">Categories</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                All ({items.length})
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {category.label}
                  {category.count !== undefined && ` (${category.count})`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Season and Difficulty Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {seasons.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-stone-700 mb-3">Season</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveSeason('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    activeSeason === 'all'
                      ? 'bg-stone-700 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All
                </button>
                {seasons.map((season) => (
                  <button
                    key={season.id}
                    onClick={() => setActiveSeason(season.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      activeSeason === season.id
                        ? 'bg-stone-700 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {season.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {difficulties.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-stone-700 mb-3">Difficulty</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveDifficulty('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    activeDifficulty === 'all'
                      ? 'bg-stone-700 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All
                </button>
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty.id}
                    onClick={() => setActiveDifficulty(difficulty.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      activeDifficulty === difficulty.id
                        ? 'bg-stone-700 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {difficulty.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderGrid = () => {
    if (loading) {
      return (
        <div className={`${getColumnClasses()} gap-6`}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-[4/3] bg-stone-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-stone-200 rounded mb-2"></div>
              <div className="h-3 bg-stone-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      );
    }

    if (filteredItems.length === 0) {
      return (
        <div className="text-center py-12">
          {emptyState || (
            <div>
              <svg className="w-16 h-16 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-lg font-medium text-stone-900 mb-2">No dishes found</h3>
              <p className="text-stone-600">
                {searchQuery 
                  ? `No results for "${searchQuery}". Try adjusting your search or filters.`
                  : 'No dishes match your current filters. Try adjusting your selection.'
                }
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`${getColumnClasses()} gap-6`}>
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.1,
                layout: { duration: 0.3 }
              }}
            >
              <ImageCard
                {...item}
                variant={item.featured ? 'featured' : 'default'}
                onClick={() => onItemClick?.(item)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {renderFilters()}
      
      {/* Results count */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-stone-600">
          Showing {filteredItems.length} of {items.length} dish{items.length !== 1 ? 'es' : ''}
        </p>
        
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
              setActiveSeason('all');
              setActiveDifficulty('all');
            }}
            className="text-sm text-stone-500 hover:text-stone-700 underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {renderGrid()}
    </div>
  );
}
