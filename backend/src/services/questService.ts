
import { prisma } from '../db';

const QUEST_TEMPLATES = [
    { title: "Фотограф", description: "Сфотографируй свое самое старое растение", xp: 15 },
    { title: "Водохлеб", description: "Полей 2 растения", xp: 10 },
    { title: "Забота", description: "Опрыскай листья растений", xp: 10 },
    { title: "Ботаник", description: "Узнай новое о своем растении через AI Доктора", xp: 20 },
    { title: "Рыночный день", description: "Проверь новые объявления на рынке", xp: 5 },
    { title: "Ревизия", description: "Проверь, не нужна ли пересадка растениям", xp: 10 },
];

export const questService = {
    async getDailyQuests(userId: string) {
        const today = new Date().toISOString().split('T')[0];

        // 1. Check existing quests for today
        const existing = await prisma.dailyQuest.findMany({
            where: { userId, date: today }
        });

        if (existing.length > 0) {
            return existing;
        }

        // 2. Generate new quests
        const shuffled = [...QUEST_TEMPLATES].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        const newQuests = [];
        for (const t of selected) {
            const q = await prisma.dailyQuest.create({
                data: {
                    userId,
                    title: t.title,
                    description: t.description,
                    xpReward: t.xp,
                    isCompleted: false,
                    date: today
                }
            });
            newQuests.push(q);
        }

        return newQuests;
    },

    async completeQuest(userId: string, questId: string) {
        const quest = await prisma.dailyQuest.findUnique({ where: { id: questId } });
        
        if (!quest || quest.userId !== userId || quest.isCompleted) {
            throw new Error("Invalid quest or already completed");
        }

        // Transaction to update quest and add XP
        await prisma.$transaction(async (tx) => {
            await tx.dailyQuest.update({
                where: { id: questId },
                data: { isCompleted: true }
            });
            
            // Add XP (duplicating logic from careService safely)
            await tx.user.update({
                where: { id: userId },
                data: { xp: { increment: quest.xpReward } }
            });
        });

        return { success: true, xpGained: quest.xpReward };
    }
};
