import React from 'react';

export interface GameManifest {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'upcoming';
  path: string;
  component: React.ComponentType;
  modes?: {
    id: string;
    name: string;
    path: string;
  }[];
}

const gamesRegistry: GameManifest[] = [];

export function registerGame(manifest: GameManifest) {
  gamesRegistry.push(manifest);
}

export function getGames() {
  return gamesRegistry;
}

export function getGameById(id: string) {
  return gamesRegistry.find(g => g.id === id);
}
