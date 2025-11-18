/**
 * useMindMapFilters Hook
 * Handles filtering and sorting of mind maps
 */

import { useMemo } from 'react';
import { MindMap } from './useMindMaps';

export type FilterType = 'all' | 'recent' | 'favorites' | 'shared';
export type SortType = 'updated' | 'created' | 'name' | 'size';

export function useMindMapFilters(
  mindMaps: MindMap[],
  searchQuery: string,
  filterBy: FilterType,
  sortBy: SortType
) {
  const filteredMaps = useMemo(() => {
    return mindMaps
      .filter(map => {
        // Search filter
        const matchesSearch = searchQuery === '' || 
          map.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          map.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          map.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Category filter
        const matchesFilter = filterBy === 'all' ||
          (filterBy === 'recent' && new Date(map.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
          (filterBy === 'favorites' && map.isFavorite) ||
          (filterBy === 'shared' && map.collaborators.length > 1);
        
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'updated':
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          case 'created':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'name':
            return a.title.localeCompare(b.title);
          case 'size':
            return b.nodeCount - a.nodeCount;
          default:
            return 0;
        }
      });
  }, [mindMaps, searchQuery, filterBy, sortBy]);

  return filteredMaps;
}
