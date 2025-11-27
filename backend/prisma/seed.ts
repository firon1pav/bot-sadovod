// @ts-nocheck
import { PrismaClient, AchievementRarity } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // 1. Achievements (Constant Data)
  const achievements = [
    { code: 'FIRST_WATER', name: 'Первый полив', description: 'Полить растение в первый раз', rarity: AchievementRarity.COMMON },
    { code: 'FIRST_PLANT', name: 'Начало коллекции', description: 'Добавить первое растение', rarity: AchievementRarity.COMMON },
    { code: 'FIVE_PLANTS', name: 'Малый сад', description: 'Собрать 5 растений', rarity: AchievementRarity.RARE },
    { code: 'TEN_PLANTS', name: 'Джунгли дома', description: 'Собрать 10 растений', rarity: AchievementRarity.EPIC },
    { code: 'FIRST_FERTILIZE', name: 'Забота о питании', description: 'Удобрить растение', rarity: AchievementRarity.COMMON },
    { code: 'FIRST_REPOT', name: 'Новый дом', description: 'Пересадить растение', rarity: AchievementRarity.RARE },
    { code: 'FIRST_TRIM', name: 'Парикмахер', description: 'Обрезать растение', rarity: AchievementRarity.COMMON },
    { code: 'FIRST_COMMUNITY', name: 'Социальный садовод', description: 'Вступить в сообщество', rarity: AchievementRarity.COMMON },
    { code: 'WATERING_MASTER', name: 'Мастер полива', description: 'Полить растения 50 раз', rarity: AchievementRarity.EPIC },
    { code: 'FIRST_FRIEND', name: 'Ты мне друг?', description: 'Добавить первого друга', rarity: AchievementRarity.COMMON },
    { code: 'COMMUNITY_FOUNDER', name: 'Лидер', description: 'Создать свое сообщество', rarity: AchievementRarity.LEGENDARY },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { code: ach.code },
      update: {},
      create: ach
    });
  }

  // 2. Default Communities
  const communities = [
      { name: 'Любители Монстер', description: 'Всё о монстерах: уход, размножение, виды.' },
      { name: 'Суккуленты и Кактусы', description: 'Клуб любителей колючих и мясистых друзей.' },
      { name: 'Городской Огород', description: 'Выращиваем овощи и зелень на балконе.' }
  ];

  for (const com of communities) {
      // Check if exists by name (simplified for seed)
      const exists = await prisma.community.findFirst({ where: { name: com.name }});
      if (!exists) {
          await prisma.community.create({
              data: com
          });
      }
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
