/**
 * useMindMaps Hook
 * Manages mind map data with localStorage persistence
 */

import { useState, useEffect } from 'react';

export interface MindMap {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  collaborators: string[];
  tags: string[];
  nodeCount: number;
  isFavorite: boolean;
  thumbnail: string | null;
  color: string;
}

const SAMPLE_MAPS: MindMap[] = [
  {
    id: 'map-1',
    title: 'Project Planning',
    description: 'Strategic planning for Q4 product launch',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    author: 'John Doe',
    collaborators: ['John Doe', 'Sarah Wilson'],
    tags: ['business', 'strategy', 'planning'],
    nodeCount: 24,
    isFavorite: true,
    thumbnail: null,
    color: '#3B82F6'
  },
  {
    id: 'map-2',
    title: 'Learning Roadmap',
    description: 'Personal development and skill acquisition plan',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    author: 'Sarah Wilson',
    collaborators: ['Sarah Wilson'],
    tags: ['education', 'personal', 'goals'],
    nodeCount: 18,
    isFavorite: false,
    thumbnail: null,
    color: '#10B981'
  }
];

export function useMindMaps() {
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);

  // Load from localStorage
  useEffect(() => {
    const savedMaps = localStorage.getItem('mindMaps');
    if (savedMaps) {
      setMindMaps(JSON.parse(savedMaps));
    } else {
      setMindMaps(SAMPLE_MAPS);
      localStorage.setItem('mindMaps', JSON.stringify(SAMPLE_MAPS));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (mindMaps.length > 0) {
      localStorage.setItem('mindMaps', JSON.stringify(mindMaps));
    }
  }, [mindMaps]);

  const createMap = (): MindMap => {
    const newMap: MindMap = {
      id: `map-${Date.now()}`,
      title: 'Untitled Mind Map',
      description: '',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      author: 'Current User',
      collaborators: ['Current User'],
      tags: [],
      nodeCount: 1,
      isFavorite: false,
      thumbnail: null,
      color: '#6366F1'
    };
    
    setMindMaps([newMap, ...mindMaps]);
    return newMap;
  };

  const deleteMap = (mapId: string) => {
    setMindMaps(mindMaps.filter(map => map.id !== mapId));
  };

  const deleteMaps = (mapIds: string[]) => {
    setMindMaps(mindMaps.filter(map => !mapIds.includes(map.id)));
  };

  const toggleFavorite = (mapId: string) => {
    setMindMaps(mindMaps.map(map => 
      map.id === mapId ? { ...map, isFavorite: !map.isFavorite } : map
    ));
  };

  const updateMapColor = (mapId: string, color: string) => {
    setMindMaps(mindMaps.map(map => 
      map.id === mapId ? { ...map, color } : map
    ));
  };

  const updateMapTitle = (mapId: string, title: string) => {
    if (title.trim()) {
      setMindMaps(mindMaps.map(map => 
        map.id === mapId ? { ...map, title: title.trim() } : map
      ));
    }
  };

  return {
    mindMaps,
    createMap,
    deleteMap,
    deleteMaps,
    toggleFavorite,
    updateMapColor,
    updateMapTitle
  };
}
