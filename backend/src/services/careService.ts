
import { PrismaClient, CareType, User, Plant } from '@prisma/client';

const prisma = new PrismaClient();

// Константы XP (должны совпадать с фронтендом)
const XP_LEVELS = [
  { level: 1, minXp: 0 },
  { level: 2, minXp: 100 },
  { level: 3, minXp: 300 },
  { level: 4, minXp: 700 },
  { level: 5, minXp: 1500 },
  // ... можно расширить
];

const CARE_XP_REWARDS: Record<string, number> = {
  WATER: 5,
  TRIM: 8,
  REPOT: 15,
  FERTILIZE: 10,
};

export const careService = {
  async performCare(userId: string, plantId: string, type: string, note?: string, photoUrl?: string) {
    // 1. Создаем событие ухода
    const careEvent = await prisma.careEvent.create({
      data: {
        userId,
        plantId,
        type,
        note,
        photoUrl
      }
    });

    // 2. Обновляем растение (даты)
    const updates: any = {};
    const now = new Date();
    
    if (type === 'WATER') updates.lastWateredAt = now;
    if (type === 'FERTILIZE') {
        updates.lastFertilizedAt = now;
        // Примерная логика: следующее удобрение через 14 дней
        const nextDate = new Date();
        nextDate.setDate(now.getDate() + 14);
        updates.nextFertilizingDate = nextDate;
    }
    if (type === 'REPOT') {
        updates.lastRepottedAt = now;
        const nextDate = new Date();
        nextDate.setDate(now.getDate() + 365);
        updates.nextRepottingDate = nextDate;
    }
    if (type === 'TRIM') {
        updates.lastTrimmedAt = now;
        const nextDate = new Date();
        nextDate.setDate(now.getDate() + 60);
        updates.nextTrimmingDate = nextDate;
    }

    await prisma.plant.update({
      where: { id: plantId },
      data: updates
    });

    // 3. Начисление XP и Уровни
    const xpGained = CARE_XP_REWARDS[type] || 5;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) throw new Error("User not found");

    const newXp = user.xp + xpGained;
    let newLevel = user.level;
    let leveledUp = false;

    // Проверка повышения уровня
    const nextLevel = XP_LEVELS.slice().reverse().find(l => newXp >= l.minXp);
    if (nextLevel && nextLevel.level > user.level) {
        newLevel = nextLevel.level;
        leveledUp = true;
    }

    await prisma.user.update({
        where: { id: userId },
        data: { xp: newXp, level: newLevel }
    });

    // 4. Проверка достижений (Achievements)
    const newAchievements = [];
    
    // Пример: Первое растение
    if (type === 'WATER') {
        const count = await prisma.careEvent.count({ where: { userId, type: 'WATER' } });
        if (count === 1) {
             const ach = await this.unlockAchievement(userId, 'FIRST_WATER');
             if (ach) newAchievements.push(ach);
        }
        if (count === 50) {
             const ach = await this.unlockAchievement(userId, 'WATERING_MASTER');
             if (ach) newAchievements.push(ach);
        }
    }

    return {
        careEvent,
        userStats: { xp: newXp, level: newLevel, leveledUp },
        newAchievements
    };
  },

  async unlockAchievement(userId: string, code: string) {
      // Ищем ID ачивки по коду (предполагаем, что таблица Achievement заполнена сидом)
      const achievement = await prisma.achievement.findUnique({ where: { code } });
      if (!achievement) return null;

      // Проверяем, есть ли уже
      const existing = await prisma.userAchievement.findUnique({
          where: { userId_achievementId: { userId, achievementId: achievement.id } }
      });

      if (!existing) {
          await prisma.userAchievement.create({
              data: { userId, achievementId: achievement.id }
          });
          return achievement;
      }
      return null;
  }
};
