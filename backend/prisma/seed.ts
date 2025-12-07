
// @ts-nocheck
import { PrismaClient, AchievementRarity } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // 1. Achievements
  const achievements = [
    // --- Start / Basics ---
    { code: 'FIRST_PLANT', name: 'Начало коллекции', description: 'Добавить самое первое растение в сад', rarity: AchievementRarity.COMMON },
    { code: 'FIRST_WATER', name: 'Первый полив', description: 'Записать первый полив в журнал', rarity: AchievementRarity.COMMON },
    { code: 'FIRST_FERTILIZE', name: 'Витаминный заряд', description: 'Удобрить растение в первый раз', rarity: AchievementRarity.COMMON },
    { code: 'FIRST_TRIM', name: 'Парикмахер', description: 'Провести первую обрезку растения', rarity: AchievementRarity.COMMON },
    { code: 'FIRST_REPOT', name: 'Новый дом', description: 'Пересадить растение в новый горшок', rarity: AchievementRarity.COMMON },
    
    // --- Collection Size ---
    { code: 'FIVE_PLANTS', name: 'Малый сад', description: 'Собрать коллекцию из 5 растений', rarity: AchievementRarity.RARE },
    { code: 'TEN_PLANTS', name: 'Джунгли дома', description: 'Выращивать 10 растений одновременно', rarity: AchievementRarity.EPIC },
    { code: 'TWENTY_PLANTS', name: 'Ботсад', description: 'Достигнуть отметки в 20 растений', rarity: AchievementRarity.EPIC },
    { code: 'FIFTY_PLANTS', name: 'Повелитель Флоры', description: 'Собрать 50 растений. Вам еще есть где спать?', rarity: AchievementRarity.LEGENDARY },

    // --- Care Counts ---
    { code: 'WATERING_MASTER', name: 'Мастер лейка', description: 'Полить растения 50 раз', rarity: AchievementRarity.RARE },
    { code: 'POSEIDON', name: 'Посейдон', description: 'Совершить 200 поливов', rarity: AchievementRarity.EPIC },
    { code: 'GREEN_THUMB', name: 'Зеленый палец', description: 'Выполнить 100 любых действий по уходу', rarity: AchievementRarity.RARE },

    // --- Time / Streaks ---
    { code: 'EARLY_BIRD', name: 'Ранняя пташка', description: 'Полить растение до 8 утра', rarity: AchievementRarity.COMMON },
    { code: 'NIGHT_OWL', name: 'Ночной дожор', description: 'Удобрить растение после 22:00', rarity: AchievementRarity.COMMON },
    { code: 'SURVIVOR', name: 'Выживший', description: 'Растение живет у вас уже месяц', rarity: AchievementRarity.COMMON },

    // --- Tech / AI ---
    { code: 'PHOTOGRAPHER', name: 'Фотограф', description: 'Обновить фото растения', rarity: AchievementRarity.COMMON },
    { code: 'AI_SCIENTIST', name: 'Ученый', description: 'Определить вид растения через AI', rarity: AchievementRarity.RARE },
    { code: 'PLANT_DOCTOR', name: 'Доктор Хаус', description: 'Провести диагностику болезни через AI', rarity: AchievementRarity.RARE },
    { code: 'CHATTERBOX', name: 'Собеседник', description: 'Поговорить со своим растением в чате', rarity: AchievementRarity.COMMON },

    // --- Social / Market ---
    { code: 'FIRST_FRIEND', name: 'Ты мне друг?', description: 'Добавить первого друга', rarity: AchievementRarity.COMMON },
    { code: 'POPULAR', name: 'Душа компании', description: 'Иметь 5 друзей садоводов', rarity: AchievementRarity.RARE },
    { code: 'FIRST_LISTING', name: 'Предприниматель', description: 'Разместить первое объявление на рынке', rarity: AchievementRarity.COMMON },
    { code: 'MARKET_GURU', name: 'Гуру рынка', description: 'Разместить 5 объявлений', rarity: AchievementRarity.EPIC },
    { code: 'HELPFUL_NEIGHBOR', name: 'Добрый сосед', description: 'Посмотреть профиль друга', rarity: AchievementRarity.COMMON },

    // --- Specific Types ---
    { code: 'SUCCULENT_LOVER', name: 'Колючий характер', description: 'Иметь 3 суккулента или кактуса', rarity: AchievementRarity.RARE },
    { code: 'TROPICAL_VIBES', name: 'Тропики', description: 'Иметь 3 пальмы или лиственных растения', rarity: AchievementRarity.RARE },
    { code: 'FLOWER_POWER', name: 'Сила цветов', description: 'Иметь 3 цветущих растения', rarity: AchievementRarity.RARE },
    
    // --- Levels ---
    { code: 'LEVEL_10', name: 'Грандмастер', description: 'Достичь 10 уровня профиля', rarity: AchievementRarity.LEGENDARY },
  ];

  // Remove deprecated achievements first (Optional safety)
  await prisma.achievement.deleteMany({});

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { code: ach.code },
      update: {
          name: ach.name,
          description: ach.description,
          rarity: ach.rarity
      },
      create: ach
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    (process as any).exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
