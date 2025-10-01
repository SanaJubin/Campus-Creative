import { useState } from 'react';

export default function FilterSort({ onFilterChange, onSortChange, currentFilters }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const postTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'art', label: '🎨 Art' },
    { value: 'writing', label: '📝 Writing' },
    { value: 'photography', label: '📸 Photography' },
    { value: 'music', label: '🎵 Music' },
    { value: 'other', label: '💫 Other' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'most_liked', label: 'Most Liked' },
    { value: 'most_commented', label: 'Most Comments' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters & Sorting</h3>
          
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="sm:hidden bg-blue-500 text-white px-3 py-1 rounded-lg text-sm"
          >
            {isFilterOpen ? 'Hide' : 'Show'} Filters
          </button>
        </div>

        {/* Active Filters Display */}
        <div className="flex flex-wrap gap-2">
          {currentFilters.post_type !== 'all' && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              Type: {postTypes.find(t => t.value === currentFilters.post_type)?.label}
            </span>
          )}
          {currentFilters.sort !== 'newest' && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
              Sort: {sortOptions.find(s => s.value === currentFilters.sort)?.label}
            </span>
          )}
        </div>
      </div>

      {/* Filter Controls - Always visible on desktop, toggle on mobile */}
      <div className={`mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 ${isFilterOpen ? 'block' : 'hidden'} sm:block`}>
        
        {/* Post Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Type
          </label>
          <select
            value={currentFilters.post_type}
            onChange={(e) => onFilterChange('post_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {postTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort by
          </label>
          <select
            value={currentFilters.sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Filter Buttons */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Filters
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onFilterChange('post_type', 'art')}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                currentFilters.post_type === 'art' 
                  ? 'bg-pink-500 text-white border-pink-500' 
                  : 'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200'
              }`}
            >
              🎨 Art Only
            </button>
            <button
              onClick={() => onFilterChange('post_type', 'writing')}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                currentFilters.post_type === 'writing' 
                  ? 'bg-green-500 text-white border-green-500' 
                  : 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
              }`}
            >
              📝 Writing Only
            </button>
            <button
              onClick={() => onFilterChange('post_type', 'all')}
              className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200 transition-colors"
            >
              Show All
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing posts {currentFilters.post_type !== 'all' ? `of type "${postTypes.find(t => t.value === currentFilters.post_type)?.label}"` : 'of all types'}
          {' '}sorted by {sortOptions.find(s => s.value === currentFilters.sort)?.label.toLowerCase()}
        </p>
      </div>
    </div>
  );
}