
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { careService } from '../services/careService';
import { aiService } from '../services/aiService';

const prisma = new PrismaClient();

export const plantController = {
  // Получить все растения пользователя
  async getAll(req: any, res: any) {
    const plants = await prisma.plant.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(plants);
  },

  // Получить растения другого пользователя (пубичный профиль)
  async getByUserId(req: any, res: any) {
    const { userId } = req.params;
    const plants = await prisma.plant.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(plants);
  },

  // Создать растение
  async create(req: any, res: any) {
    const { name, type, location, wateringFrequencyDays, customLocation, customType, lastWateredAt } = req.body;
    const file = req.file;

    // Construct full URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const photoUrl = file ? `${baseUrl}/uploads/${file.filename}` : 'https://placehold.co/400';

    const plant = await prisma.plant.create({
      data: {
        userId: req.user!.id,
        name,
        type,
        location,
        customLocation,
        customType,
        wateringFrequencyDays: Number(wateringFrequencyDays),
        lastWateredAt: lastWateredAt ? new Date(lastWateredAt) : new Date(),
        photoUrl: photoUrl,
      }
    });

    await prisma.user.update({
        where: { id: req.user!.id },
        data: { xp: { increment: 20 } }
    });

    res.json(plant);
  },

  // Обновить растение
  async update(req: any, res: any) {
      const { id } = req.params;
      const { 
          name, location, type, wateringFrequencyDays, 
          nextFertilizingDate, nextRepottingDate, nextTrimmingDate 
      } = req.body;
      const file = req.file;

      const updates: any = {};
      if (name) updates.name = name;
      if (location) updates.location = location;
      if (type) updates.type = type;
      if (wateringFrequencyDays) updates.wateringFrequencyDays = Number(wateringFrequencyDays);
      
      if (nextFertilizingDate) updates.nextFertilizingDate = new Date(nextFertilizingDate);
      if (nextRepottingDate) updates.nextRepottingDate = new Date(nextRepottingDate);
      if (nextTrimmingDate) updates.nextTrimmingDate = new Date(nextTrimmingDate);

      if (file) {
          const baseUrl = `${req.protocol}://${req.get('host')}`;
          updates.photoUrl = `${baseUrl}/uploads/${file.filename}`;
      }

      try {
          const updatedPlant = await prisma.plant.update({
              where: { id: id, userId: req.user!.id },
              data: updates
          });
          res.json(updatedPlant);
      } catch (e) {
          res.status(403).json({ error: "Failed to update or unauthorized" });
      }
  },

  // Удалить растение
  async delete(req: any, res: any) {
      const { id } = req.params;
      try {
          await prisma.plant.delete({
              where: { id: id, userId: req.user!.id }
          });
          res.json({ success: true });
      } catch (e) {
          res.status(403).json({ error: "Failed to delete or unauthorized" });
      }
  },

  // Выполнить уход
  async care(req: any, res: any) {
    const { id } = req.params;
    const { type, note } = req.body;
    
    try {
        const result = await careService.performCare(req.user!.id, id, type, note);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: 'Care failed' });
    }
  },

  // Идентификация через AI
  async identify(req: any, res: any) {
      if (!req.file) return res.status(400).json({ error: 'No image provided' });
      try {
          const result = await aiService.identifyPlant(req.file.path, req.file.mimetype);
          res.json(result);
      } catch (e) {
          res.status(500).json({ error: 'AI Identification failed' });
      }
  },

  // Диагностика через AI
  async diagnose(req: any, res: any) {
      if (!req.file) return res.status(400).json({ error: 'No image provided' });
      try {
          const result = await aiService.diagnosePlant(req.file.path, req.file.mimetype);
          res.send(result); // Plain text response
      } catch (e) {
          res.status(500).json({ error: 'AI Diagnose failed' });
      }
  },

  // Чат через AI
  async chat(req: any, res: any) {
      const { message, plantId } = req.body;
      try {
          // Fetch plant context
          const plant = await prisma.plant.findUnique({ where: { id: plantId } });
          if (!plant) return res.status(404).json({ error: "Plant not found" });

          const context = {
              name: plant.name,
              type: plant.type,
              location: plant.location,
              lastWatered: plant.lastWateredAt,
              wateringFrequency: plant.wateringFrequencyDays
          };

          const response = await aiService.chatWithPlantExpert(message, context);
          res.send(response);
      } catch (e) {
          res.status(500).json({ error: 'AI Chat failed' });
      }
  }
};
