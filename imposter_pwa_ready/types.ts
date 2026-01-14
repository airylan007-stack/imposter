export enum GamePhase {
  SETUP = 'SETUP',
  LOADING = 'LOADING',
  DISTRIBUTION = 'DISTRIBUTION',
  DISCUSSION = 'DISCUSSION',
  REVEAL = 'REVEAL'
}

export enum Category {
  Sports = 'Sports',
  Locations = 'Locations',
  Foods = 'Foods',
  Animals = 'Animals',
  HistoricalEvents = 'Historical Events',
  People = 'People',
  Professions = 'Professions',
  Brands = 'Brands',
  Vehicles = 'Vehicles',
  Tools = 'Tools',
  Games = 'Games',
  Cities = 'Cities',
  Holidays = 'Holidays',
  Objects = 'Objects'
}

export interface Player {
  id: string;
  name: string;
  isImposter: boolean;
  hasViewed: boolean;
}

export interface GameSettings {
  categories: Record<Category, boolean>;
  numImposters: number;
  showCategoryToImposter: boolean;
  showHintToImposter: boolean;
  hintDifficulty: number; // 1-10
}

export interface RoundData {
  secretWord: string;
  category: string;
  hint: string;
}

export interface GameStats {
  discussionDurationSeconds: number;
}