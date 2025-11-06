import { CareType, PlantLocation, PlantType } from './types';

export const XP_LEVELS = [
  { level: 1, name: 'Росток', icon: '🌱', minXp: 0 },
  { level: 2, name: 'Саженец', icon: '🌿', minXp: 100 },
  { level: 3, name: 'Деревце', icon: '🌳', minXp: 300 },
  { level: 4, name: 'Цветок', icon: '🌸', minXp: 700 },
  { level: 5, name: 'Опытный цветовод', icon: '🌺', minXp: 1500 },
  { level: 6, name: 'Садовник', icon: '🧑‍🌾', minXp: 2500 },
  { level: 7, name: 'Ландшафтный дизайнер', icon: '🏞️', minXp: 4000 },
  { level: 8, name: 'Хранитель рощи', icon: '🌴', minXp: 6000 },
  { level: 9, name: 'Друид', icon: '🧙', minXp: 8500 },
  { level: 10, name: 'Мастер-садовод', icon: '👑', minXp: 12000 },
];

export const CARE_XP_REWARDS: Record<CareType, number> = {
  [CareType.WATER]: 5,
  [CareType.TRIM]: 8,
  [CareType.REPOT]: 15,
  [CareType.FERTILIZE]: 10,
};

export const PLANT_LOCATIONS_OPTIONS = Object.values(PlantLocation);
export const PLANT_TYPES_OPTIONS = Object.values(PlantType);

export const DEFAULT_WATERING_FREQUENCY: Record<PlantType, number> = {
    [PlantType.SUCCULENT]: 14,
    [PlantType.PALM]: 7,
    [PlantType.FOLIAGE]: 5,
    [PlantType.FLOWERING]: 4,
    [PlantType.OTHER]: 7,
};
