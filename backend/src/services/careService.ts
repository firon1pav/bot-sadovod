
import { CareType, User, Plant } from '@prisma/client';
import { prisma } from '../db';

// Константы XP (Синхронизировано с фронтендом)
const XP_LEVELS = [
  { level: 1, minXp: 0 },
  { level: 2, minXp: 100 },
  { level: 3, minXp: 300 },
  { level: 4, minXp: 700 },
  { level: 5, minXp: 1500 },
  { level: 6, minXp: 2500 },
  { level: 7, minXp: 4000 },
  { level: 8, minXp: 6000 },
  { level: 9, minXp: 8500 },
  { level: 10, minXp: 12000 },
];

const CARE_XP_REWARDS: Record<string, number> = {
  WATER: 5,
  TRIM: 8,
  REPOT: 15,
  FERTILIZE: 10,
};

export const careService = {
  // Universal method to add XP safely with Transaction Support
  async addXp(userId: string, amount: number, tx: any = prisma) {
      if (!amount || amount <= 0) return { xp: 0, level: 0, leveledUp: false }; // Safety check

      // 1. Atomic Increment via Transaction (or passed context)
      const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { xp: { increment: amount } }
      });

      const newXp = updatedUser.xp;
      let newLevel = updatedUser.level;
      let leveledUp = false;

      // 2. Check Level Up based on new atomic value
      const nextLevel = XP_LEVELS.slice().reverse().find(l => newXp >= l.minXp);
      
      if (nextLevel && nextLevel.level > updatedUser.level) {
          newLevel = nextLevel.level;
          leveledUp = true;
          
          // Update level if changed
          await tx.user.update({
              where: { id: userId },
              data: { level: newLevel }
          });

          // Check Level 10 Achievement
          if (newLevel >= 10) {
              await this.unlockAchievement(userId, 'LEVEL_10', tx);
          }
      }

      return { xp: newXp, level: newLevel, leveledUp };
  },

  async performCare(userId: string, plantId: string, type: string, note?: string, photoUrl?: string) {
    // WRAP IN TRANSACTION to ensure data integrity
    return await prisma.$transaction(async (tx) => {
        // 1. Создаем событие ухода
        const careEvent = await tx.careEvent.create({
          data: {
            userId,
            plantId,
            type,
            note,
            photoUrl
          }
        });

        // 2. Получаем данные растения для умного расчета
        const plant = await tx.plant.findUnique({ where: { id: plantId } });
        if (!plant) throw new Error("Plant not found");

        // "Сердцебиение" растения - частота полива (по умолчанию 7 дней)
        const frequency = plant.wateringFrequencyDays || 7;

        // 3. Обновляем растение (даты)
        const updates: any = {};
        const now = new Date();
        const currentHour = now.getHours();
        
        if (type === 'WATER') {
            updates.lastWateredAt = now;
        }
        
        if (type === 'FERTILIZE') {
            updates.lastFertilizedAt = now;
            // Удобрение: 4 цикла полива, но не чаще 14 дней
            const daysToAdd = Math.max(14, frequency * 4);
            const nextDate = new Date();
            nextDate.setDate(now.getDate() + daysToAdd);
            updates.nextFertilizingDate = nextDate;
        }
        
        if (type === 'REPOT') {
            updates.lastRepottedAt = now;
            // Пересадка: стандартно раз в год (365 дней)
            const nextDate = new Date();
            nextDate.setDate(now.getDate() + 365);
            updates.nextRepottingDate = nextDate;
        }
        
        if (type === 'TRIM') {
            updates.lastTrimmedAt = now;
            // Обрезка: 10 циклов полива, но не чаще 30 дней
            const daysToAdd = Math.max(30, frequency * 10);
            const nextDate = new Date();
            nextDate.setDate(now.getDate() + daysToAdd);
            updates.nextTrimmingDate = nextDate;
        }

        const updatedPlant = await tx.plant.update({
          where: { id: plantId },
          data: updates
        });

        // 4. Начисление XP (pass the transaction context)
        const xpGained = CARE_XP_REWARDS[type] || 0;
        const userStats = await this.addXp(userId, xpGained, tx);

        // 5. Проверка достижений (Achievements)
        const newAchievements = [];
        
        // --- TYPE SPECIFIC ---
        if (type === 'WATER') {
            const count = await tx.careEvent.count({ where: { userId, type: 'WATER' } });
            if (count === 1) await this.unlockAchievement(userId, 'FIRST_WATER', tx);
            if (count === 50) await this.unlockAchievement(userId, 'WATERING_MASTER', tx);
            if (count === 200) await this.unlockAchievement(userId, 'POSEIDON', tx);
            
            // Time: Early Bird (< 8 AM)
            if (currentHour < 8) await this.unlockAchievement(userId, 'EARLY_BIRD', tx);
        }
        else if (type === 'FERTILIZE') {
            const count = await tx.careEvent.count({ where: { userId, type: 'FERTILIZE' } });
            if (count === 1) await this.unlockAchievement(userId, 'FIRST_FERTILIZE', tx);
            
            // Time: Night Owl (>= 22 PM)
            if (currentHour >= 22) await this.unlockAchievement(userId, 'NIGHT_OWL', tx);
        }
        else if (type === 'TRIM') {
            const count = await tx.careEvent.count({ where: { userId, type: 'TRIM' } });
            if (count === 1) await this.unlockAchievement(userId, 'FIRST_TRIM', tx);
        }
        else if (type === 'REPOT') {
            const count = await tx.careEvent.count({ where: { userId, type: 'REPOT' } });
            if (count === 1) await this.unlockAchievement(userId, 'FIRST_REPOT', tx);
        }

        // --- GENERAL ---
        const totalEvents = await tx.careEvent.count({ where: { userId } });
        if (totalEvents === 100) await this.unlockAchievement(userId, 'GREEN_THUMB', tx);

        // --- PLANT AGE ---
        // Survivor: Plant created > 30 days ago
        const plantAgeDays = (now.getTime() - new Date(plant.createdAt).getTime()) / (1000 * 3600 * 24);
        if (plantAgeDays > 30) {
            await this.unlockAchievement(userId, 'SURVIVOR', tx);
        }

        return {
            careEvent,
            updatedPlant,
            userStats,
            newAchievements
        };
    });
  },

  async unlockAchievement(userId: string, code: string, tx: any = prisma) {
      const achievement = await tx.achievement.findUnique({ where: { code } });
      if (!achievement) return null;

      try {
          // Use create directly and catch error for atomicity check
          // If already exists, it throws P2002
          await tx.userAchievement.create({
              data: { userId, achievementId: achievement.id }
          });
          return achievement;
      } catch (e: any) {
          // P2002 = Unique constraint failed (Already unlocked)
          if (e.code === 'P2002') return null;
          console.error("Unlock achievement error", e);
          return null;
      }
  }
};
