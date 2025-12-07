
import { Request, Response } from 'express';
import { careService } from '../services/careService';
import { aiService } from '../services/aiService';
import { weatherService } from '../services/weatherService';
import { prisma } from '../db';
import fs from 'fs';
import path from 'path';

// Helper to delete file from uploads
const deleteFile = (fileUrl: string) => {
    if (!fileUrl) return;
    try {
        const urlParts = fileUrl.split('/');
        // SECURITY FIX: Use path.basename to prevent Path Traversal attacks (e.g. ../../)
        const filename = path.basename(urlParts[urlParts.length - 1]);
        
        if (!filename) return;
        const filePath = path.resolve('uploads', filename);
        
        // Double check strict path
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) console.error(`Failed to delete file: ${filePath}`, err);
            });
        }
    } catch (e) {
        console.error("Error deleting file:", e);
    }
};

// Helper to delete local file (from req.file.path)
const deleteLocalFile = (filePath: string) => {
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, () => {});
    }
};

// SECURITY FIX: Basic HTML Sanitization
const stripHtml = (str: string | undefined | null) => {
    if (!str) return str;
    return String(str).replace(/<[^>]*>?/gm, '');
};

// Helper to check and increment AI usage (Monthly limit 5)
const checkAiLimit = async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const now = new Date();
    // Use aiLastResetDate or Epoch if null
    const lastReset = user.aiLastResetDate ? new Date(user.aiLastResetDate) : new Date(0); 

    // Check if we are in a new month compared to last reset
    const isNewMonth = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();

    if (isNewMonth) {
        // Reset counter for new month
        await prisma.user.update({
            where: { id: userId },
            data: { 
                aiRequestsCount: 1, // This is the first request of the new month
                aiLastResetDate: now 
            }
        });
        return true;
    }

    // Check limit (5 per month)
    if (user.aiRequestsCount >= 5) {
        return false;
    }

    // Increment usage within same month
    await prisma.user.update({
        where: { id: userId },
        data: { aiRequestsCount: { increment: 1 } }
    });

    return true;
};

export const plantController = {
  // Получить все растения пользователя
  async getAll(req: any, res: any) {
    const plants = await prisma.plant.findMany({
      where: { userId: req.user!.id, isForSale: false }, // Filter out market items from personal garden list if desired
      orderBy: { createdAt: 'desc' }
    });
    res.json(plants);
  },

  // Получить растения другого пользователя (пубичный профиль)
  async getByUserId(req: any, res: any) {
    const { userId } = req.params;
    const plants = await prisma.plant.findMany({
      where: { userId: userId, isForSale: false },
      orderBy: { createdAt: 'desc' }
    });
    res.json(plants);
  },

  // Создать растение
  async create(req: any, res: any) {
    const { 
        name, type, location, wateringFrequencyDays, customLocation, customType, lastWateredAt,
        // Market fields
        price, city, description, isForSale
    } = req.body;
    const file = req.file;

    // VALIDATION & SANITIZATION
    const safeName = stripHtml(name);
    
    if (!safeName || safeName.length > 50) {
        if (file) deleteLocalFile(file.path);
        return res.status(400).json({ error: "Название слишком длинное (макс. 50 символов) или пустое" });
    }
    
    // CRITICAL FIX: Ensure frequency is at least 1 to prevent division by zero or infinite loops
    let frequency = Number(wateringFrequencyDays);
    if (isNaN(frequency) || frequency < 1) {
        frequency = 7; // Default to weekly if invalid
    }

    // LOGIC FIX: Prevent future dates (Time Traveler)
    let wateredDate = lastWateredAt ? new Date(lastWateredAt) : new Date();
    if (wateredDate > new Date()) {
        wateredDate = new Date();
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const photoUrl = file ? `${baseUrl}/uploads/${file.filename}` : 'https://placehold.co/400';

    const forSale = isForSale === 'true' || isForSale === true;

    try {
        const plant = await prisma.plant.create({
            data: {
                userId: req.user!.id,
                name: safeName,
                type: stripHtml(type) || 'OTHER',
                location: stripHtml(location) || 'HOME',
                customLocation: location === 'OTHER' ? stripHtml(customLocation) : null,
                customType: type === 'OTHER' ? stripHtml(customType) : null,
                wateringFrequencyDays: frequency,
                lastWateredAt: wateredDate,
                photoUrl,
                createdAt: new Date(),
                // Market logic
                isForSale: forSale,
                price: price ? Number(price) : null,
                city: stripHtml(city) || null,
                description: stripHtml(description) || null,
            }
        });

        await careService.addXp(req.user!.id, 20);

        // --- ACHIEVEMENT CHECKS ---
        if (forSale) {
            // Market Achievements
            await careService.unlockAchievement(req.user!.id, 'FIRST_LISTING');
            
            const marketCount = await prisma.plant.count({ where: { userId: req.user!.id, isForSale: true } });
            if (marketCount === 5) await careService.unlockAchievement(req.user!.id, 'MARKET_GURU');
        } else {
            // Collection Achievements
            const count = await prisma.plant.count({ where: { userId: req.user!.id, isForSale: false } });
            if (count === 1) await careService.unlockAchievement(req.user!.id, 'FIRST_PLANT');
            if (count === 5) await careService.unlockAchievement(req.user!.id, 'FIVE_PLANTS');
            if (count === 10) await careService.unlockAchievement(req.user!.id, 'TEN_PLANTS');
            if (count === 20) await careService.unlockAchievement(req.user!.id, 'TWENTY_PLANTS');
            if (count === 50) await careService.unlockAchievement(req.user!.id, 'FIFTY_PLANTS');

            // Type Achievements
            if (type === 'SUCCULENT') {
                const succCount = await prisma.plant.count({ where: { userId: req.user!.id, type: 'SUCCULENT', isForSale: false } });
                if (succCount === 3) await careService.unlockAchievement(req.user!.id, 'SUCCULENT_LOVER');
            }
            if (type === 'FLOWERING') {
                const flowerCount = await prisma.plant.count({ where: { userId: req.user!.id, type: 'FLOWERING', isForSale: false } });
                if (flowerCount === 3) await careService.unlockAchievement(req.user!.id, 'FLOWER_POWER');
            }
            if (type === 'PALM' || type === 'FOLIAGE') {
                const tropCount = await prisma.plant.count({ 
                    where: { userId: req.user!.id, type: { in: ['PALM', 'FOLIAGE'] }, isForSale: false } 
                });
                if (tropCount === 3) await careService.unlockAchievement(req.user!.id, 'TROPICAL_VIBES');
            }
        }

        res.json(plant);
    } catch (e) {
        if (file) deleteLocalFile(file.path);
        console.error("Create plant error:", e);
        res.status(500).json({ error: "Failed to create plant" });
    }
  },

  // Update plant
  async update(req: any, res: any) {
      const { id } = req.params;
      const { 
          name, type, location, wateringFrequencyDays, customLocation, customType, lastWateredAt,
          price, city, description, isForSale
      } = req.body;
      const file = req.file;

      try {
          const plant = await prisma.plant.findUnique({ where: { id } });
          if (!plant || plant.userId !== req.user!.id) {
              if (file) deleteLocalFile(file.path);
              return res.status(403).json({ error: "Unauthorized or not found" });
          }

          const updates: any = {};
          if (name) updates.name = stripHtml(name);
          if (type) updates.type = stripHtml(type);
          if (location) updates.location = stripHtml(location);
          if (customLocation !== undefined) updates.customLocation = stripHtml(customLocation);
          if (customType !== undefined) updates.customType = stripHtml(customType);
          
          if (lastWateredAt) {
              let date = new Date(lastWateredAt);
              if (date > new Date()) date = new Date(); // Fix future date
              updates.lastWateredAt = date;
          }
          
          // Market logic
          if (isForSale !== undefined) updates.isForSale = String(isForSale) === 'true';
          if (price !== undefined) updates.price = Number(price);
          if (city !== undefined) updates.city = stripHtml(city);
          if (description !== undefined) updates.description = stripHtml(description);

          if (file) {
              const baseUrl = `${req.protocol}://${req.get('host')}`;
              updates.photoUrl = `${baseUrl}/uploads/${file.filename}`;
              
              // Unlock Photographer achievement
              await careService.unlockAchievement(req.user!.id, 'PHOTOGRAPHER');
          }

          // Smart Schedule Update: Recalculate dependent dates if frequency changes
          if (wateringFrequencyDays) {
              let newFrequency = Number(wateringFrequencyDays);
              // CRITICAL FIX: Enforce minimum frequency
              if (isNaN(newFrequency) || newFrequency < 1) newFrequency = 7;
              
              updates.wateringFrequencyDays = newFrequency;

              // Recalculate Fertilizer (approx 4x water frequency, min 14 days)
              if (plant.lastFertilizedAt) {
                  const daysToAdd = Math.max(14, newFrequency * 4);
                  const nextDate = new Date(plant.lastFertilizedAt);
                  nextDate.setDate(nextDate.getDate() + daysToAdd);
                  updates.nextFertilizingDate = nextDate;
              }

              // Recalculate Trimming (approx 10x water frequency, min 30 days)
              if (plant.lastTrimmedAt) {
                  const daysToAdd = Math.max(30, newFrequency * 10);
                  const nextDate = new Date(plant.lastTrimmedAt);
                  nextDate.setDate(nextDate.getDate() + daysToAdd);
                  updates.nextTrimmingDate = nextDate;
              }
          }

          const updatedPlant = await prisma.plant.update({
              where: { id },
              data: updates
          });

          res.json(updatedPlant);
      } catch (e) {
          if (file) deleteLocalFile(file.path);
          console.error("Update plant error:", e);
          res.status(500).json({ error: "Failed to update plant" });
      }
  },

  // Delete plant
  async delete(req: any, res: any) {
      const { id } = req.params;
      try {
          const plant = await prisma.plant.findUnique({ where: { id } });
          if (!plant || plant.userId !== req.user!.id) return res.status(403).json({ error: "Unauthorized" });

          await prisma.$transaction([
              prisma.careEvent.deleteMany({ where: { plantId: id } }),
              prisma.plant.delete({ where: { id } })
          ]);

          if (plant.photoUrl) deleteFile(plant.photoUrl);
          res.json({ success: true });
      } catch (e) {
          res.status(500).json({ error: "Failed to delete plant" });
      }
  },

  // Log Care Event
  async care(req: any, res: any) {
      const { id } = req.params;
      const { type, note } = req.body;
      const userId = req.user!.id;

      // SECURITY FIX: Prevent DoS via massive text payloads
      if (note && note.length > 500) {
          return res.status(400).json({ error: "Заметка слишком длинная (макс. 500 символов)" });
      }

      try {
          const plant = await prisma.plant.findUnique({ where: { id } });
          if (!plant || plant.userId !== userId) return res.status(403).json({ error: "Unauthorized" });

          const result = await careService.performCare(userId, id, type, note);
          res.json(result);
      } catch (e) {
          res.status(500).json({ error: "Failed to log care event" });
      }
  },

  // NEW: Get Timelapse Images
  async getTimelapse(req: any, res: any) {
      const { id } = req.params;
      try {
          const plant = await prisma.plant.findUnique({ where: { id } });
          if (!plant) return res.status(404).json({ error: "Plant not found" });

          // Get main photo
          const mainPhoto = { url: plant.photoUrl, date: plant.createdAt };

          // Get care event photos
          const carePhotos = await prisma.careEvent.findMany({
              where: { 
                  plantId: id,
                  photoUrl: { not: null }
              },
              orderBy: { occurredAt: 'asc' },
              select: { photoUrl: true, occurredAt: true }
          });

          const images = [
              mainPhoto,
              ...carePhotos.map((cp: any) => ({ url: cp.photoUrl, date: cp.occurredAt }))
          ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          res.json(images);
      } catch (e) {
          console.error(e);
          res.status(500).json({ error: "Failed to get timelapse" });
      }
  },

  // NEW: Get Swap Market
  async getMarket(req: any, res: any) {
      try {
          const plants = await prisma.plant.findMany({
              where: {
                  isForSale: true
              },
              orderBy: { createdAt: 'desc' },
          });
          
          // Enrich with owner info
          const enrichedPlants = await Promise.all(plants.map(async (p: any) => {
              const user = await prisma.user.findUnique({ where: { id: p.userId } });
              return {
                  ...p,
                  sellerName: user?.firstName || user?.username || 'Продавец',
                  sellerTelegram: user?.username || '',
                  sellerPhotoUrl: user?.photoUrl
              };
          }));
          
          res.json(enrichedPlants);
      } catch (e) {
          console.error("Market fetch error", e);
          res.status(500).json({ error: "Failed to fetch market" });
      }
  },

  // NEW: Weather Check
  async checkWeather(req: any, res: any) {
      const { lat, lon } = req.body;
      if (!lat || !lon) return res.status(400).json({ error: "Coords required" });

      try {
          // Check if user has outdoor plants
          const outdoorPlants = await prisma.plant.count({
              where: {
                  userId: req.user!.id,
                  location: { in: ['BALCONY', 'GARDEN'] }
              }
          });

          if (outdoorPlants === 0) {
              return res.json({ alert: null });
          }

          const alert = await weatherService.getWeatherAlert(Number(lat), Number(lon));
          res.json({ alert });
      } catch (e) {
          res.status(500).json({ error: "Weather check failed" });
      }
  },

  // AI Routes
  async identify(req: any, res: any) {
      const file = req.file;
      if (!file) return res.status(400).json({ error: "Image is required" });
      
      try {
          const allowed = await checkAiLimit(req.user!.id);
          if (!allowed) {
              deleteLocalFile(file.path);
              return res.status(429).json({ error: "Лимит AI запросов (5/мес) исчерпан. Ждем вас в следующем месяце!" });
          }

          const result = await aiService.identifyPlant(file.path, file.mimetype);
          deleteLocalFile(file.path);
          
          await careService.unlockAchievement(req.user!.id, 'AI_SCIENTIST');
          res.json(result);
      } catch (e: any) {
          deleteLocalFile(file.path);
          res.status(500).json({ error: e.message });
      }
  },

  async diagnose(req: any, res: any) {
      const file = req.file;
      if (!file) return res.status(400).json({ error: "Image is required" });
      
      try {
          const allowed = await checkAiLimit(req.user!.id);
          if (!allowed) {
              deleteLocalFile(file.path);
              return res.status(429).json({ error: "Лимит AI запросов (5/мес) исчерпан. Ждем вас в следующем месяце!" });
          }

          const result = await aiService.diagnosePlant(file.path, file.mimetype);
          deleteLocalFile(file.path);
          
          await careService.unlockAchievement(req.user!.id, 'PLANT_DOCTOR');
          res.send(result);
      } catch (e: any) {
          deleteLocalFile(file.path);
          res.status(500).json({ error: e.message });
      }
  },

  async chat(req: any, res: any) {
      const { message, plantId, history } = req.body;
      try {
          const allowed = await checkAiLimit(req.user!.id);
          if (!allowed) {
              return res.status(429).json({ error: "Лимит AI запросов (5/мес) исчерпан. Ждем вас в следующем месяце!" });
          }

          const plant = await prisma.plant.findUnique({ where: { id: plantId } });
          const plantContext = { name: plant.name, type: plant.type, location: plant.location };
          const response = await aiService.chatWithPlantExpert(message, plantContext, history || []);
          
          await careService.unlockAchievement(req.user!.id, 'CHATTERBOX');
          res.send(response);
      } catch (e: any) {
          res.status(500).json({ error: e.message });
      }
  }
};
