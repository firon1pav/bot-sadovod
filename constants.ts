
import { CareType, PlantLocation, PlantType, Achievement, AchievementRarity } from './types';

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

// --- 30 ACHIEVEMENTS MASTER LIST ---
export const MASTER_ACHIEVEMENTS: Achievement[] = [
    // --- Start / Basics ---
    { id: 'ach_1', code: 'FIRST_PLANT', name: 'Начало коллекции', description: 'Добавить самое первое растение в сад', icon: '🌱', rarity: AchievementRarity.COMMON },
    { id: 'ach_2', code: 'FIRST_WATER', name: 'Первый полив', description: 'Записать первый полив в журнал', icon: '💧', rarity: AchievementRarity.COMMON },
    { id: 'ach_3', code: 'FIRST_FERTILIZE', name: 'Витаминный заряд', description: 'Удобрить растение в первый раз', icon: '🧪', rarity: AchievementRarity.COMMON },
    { id: 'ach_4', code: 'FIRST_TRIM', name: 'Парикмахер', description: 'Провести первую обрезку растения', icon: '✂️', rarity: AchievementRarity.COMMON },
    { id: 'ach_5', code: 'FIRST_REPOT', name: 'Новый дом', description: 'Пересадить растение в новый горшок', icon: '🪴', rarity: AchievementRarity.COMMON },
    
    // --- Collection Size ---
    { id: 'ach_6', code: 'FIVE_PLANTS', name: 'Малый сад', description: 'Собрать коллекцию из 5 растений', icon: '🏡', rarity: AchievementRarity.RARE },
    { id: 'ach_7', code: 'TEN_PLANTS', name: 'Джунгли дома', description: 'Выращивать 10 растений одновременно', icon: '🌴', rarity: AchievementRarity.EPIC },
    { id: 'ach_8', code: 'TWENTY_PLANTS', name: 'Ботсад', description: 'Достигнуть отметки в 20 растений', icon: '🏞️', rarity: AchievementRarity.EPIC },
    { id: 'ach_9', code: 'FIFTY_PLANTS', name: 'Повелитель Флоры', description: 'Собрать 50 растений. Вам еще есть где спать?', icon: '👑', rarity: AchievementRarity.LEGENDARY },

    // --- Care Counts ---
    { id: 'ach_10', code: 'WATERING_MASTER', name: 'Мастер лейка', description: 'Полить растения 50 раз', icon: '🚿', rarity: AchievementRarity.RARE },
    { id: 'ach_11', code: 'POSEIDON', name: 'Посейдон', description: 'Совершить 200 поливов', icon: '🌊', rarity: AchievementRarity.EPIC },
    { id: 'ach_12', code: 'GREEN_THUMB', name: 'Зеленый палец', description: 'Выполнить 100 любых действий по уходу', icon: '👍', rarity: AchievementRarity.RARE },

    // --- Time / Streaks ---
    { id: 'ach_13', code: 'EARLY_BIRD', name: 'Ранняя пташка', description: 'Полить растение до 8 утра', icon: '🌅', rarity: AchievementRarity.COMMON },
    { id: 'ach_14', code: 'NIGHT_OWL', name: 'Ночной дожор', description: 'Удобрить растение после 10 вечера', icon: '🦉', rarity: AchievementRarity.COMMON },
    { id: 'ach_15', code: 'STREAK_7', name: 'Неделя заботы', description: 'Заходить в приложение 7 дней подряд', icon: '🔥', rarity: AchievementRarity.RARE },
    { id: 'ach_16', code: 'SURVIVOR', name: 'Выживший', description: 'Растение живет у вас уже месяц', icon: '🗓️', rarity: AchievementRarity.COMMON },

    // --- Tech / AI ---
    { id: 'ach_17', code: 'PHOTOGRAPHER', name: 'Фотограф', description: 'Обновить фото растения', icon: '📸', rarity: AchievementRarity.COMMON },
    { id: 'ach_18', code: 'AI_SCIENTIST', name: 'Ученый', description: 'Определить вид растения через AI', icon: '🤖', rarity: AchievementRarity.RARE },
    { id: 'ach_19', code: 'PLANT_DOCTOR', name: 'Доктор Хаус', description: 'Провести диагностику болезни через AI', icon: '🩺', rarity: AchievementRarity.RARE },
    { id: 'ach_20', code: 'CHATTERBOX', name: 'Собеседник', description: 'Поговорить со своим растением в чате', icon: '💬', rarity: AchievementRarity.COMMON },

    // --- Social ---
    { id: 'ach_21', code: 'FIRST_FRIEND', name: 'Ты мне друг?', description: 'Добавить первого друга', icon: '🤝', rarity: AchievementRarity.COMMON },
    { id: 'ach_22', code: 'POPULAR', name: 'Душа компании', description: 'Иметь 5 друзей садоводов', icon: '😎', rarity: AchievementRarity.RARE },
    { id: 'ach_23', code: 'FIRST_COMMUNITY', name: 'Социальный садовод', description: 'Вступить в любое сообщество', icon: '📢', rarity: AchievementRarity.COMMON },
    { id: 'ach_24', code: 'COMMUNITY_FOUNDER', name: 'Лидер', description: 'Создать свое собственное сообщество', icon: '🚩', rarity: AchievementRarity.LEGENDARY },
    { id: 'ach_25', code: 'COMMENTATOR', name: 'Критик', description: 'Оставить комментарий к посту', icon: '📝', rarity: AchievementRarity.COMMON },
    { id: 'ach_26', code: 'INFLUENCER', name: 'Инфлюенсер', description: 'Получить 10 лайков на свой пост', icon: '❤️', rarity: AchievementRarity.EPIC },

    // --- Specific Types ---
    { id: 'ach_27', code: 'SUCCULENT_LOVER', name: 'Колючий характер', description: 'Иметь 3 суккулента или кактуса', icon: '🌵', rarity: AchievementRarity.RARE },
    { id: 'ach_28', code: 'TROPICAL_VIBES', name: 'Тропики', description: 'Иметь 3 пальмы или лиственных растения', icon: '🏖️', rarity: AchievementRarity.RARE },
    { id: 'ach_29', code: 'FLOWER_POWER', name: 'Сила цветов', description: 'Иметь 3 цветущих растения', icon: '💐', rarity: AchievementRarity.RARE },
    
    // --- Levels ---
    { id: 'ach_30', code: 'LEVEL_10', name: 'Грандмастер', description: 'Достичь 10 уровня профиля', icon: '🎓', rarity: AchievementRarity.LEGENDARY },
];