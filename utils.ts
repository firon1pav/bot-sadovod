
import { CareType, PlantLocation, PlantType } from './types';
// @ts-ignore
import imageCompression from 'browser-image-compression';

export const CARE_TYPE_RUSSIAN: Record<CareType, string> = {
  [CareType.WATER]: 'Полив',
  [CareType.TRIM]: 'Обрезка',
  [CareType.REPOT]: 'Пересадка',
  [CareType.FERTILIZE]: 'Подкормка',
};

export const PLANT_LOCATION_RUSSIAN: Record<PlantLocation, string> = {
    [PlantLocation.HOME]: 'Дом',
    [PlantLocation.BALCONY]: 'Балкон',
    [PlantLocation.OFFICE]: 'Офис',
    [PlantLocation.GARDEN]: 'Сад',
    [PlantLocation.OTHER]: 'Другое',
};

export const PLANT_TYPE_RUSSIAN: Record<PlantType, string> = {
    [PlantType.FOLIAGE]: 'Лиственное',
    [PlantType.FLOWERING]: 'Цветущее',
    [PlantType.SUCCULENT]: 'Суккулент',
    [PlantType.PALM]: 'Пальма',
    [PlantType.OTHER]: 'Другое',
};

export const formatDateGroup = (date: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    const diffTime = checkDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Завтра';
    if (diffDays === -1) return 'Вчера';

    if (diffDays > 1) {
        if (diffDays > 1 && diffDays < 5) return `Через ${diffDays} дня`;
        return `Через ${diffDays} дней`;
    }

    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        // year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
};

export const getTodayString = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const compressImage = async (file: File): Promise<File> => {
    const options = {
        maxSizeMB: 0.5, // Target 500KB
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        fileType: 'image/jpeg',
        initialQuality: 0.8
    };
    try {
        console.log(`Compressing image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        const compressedFile = await imageCompression(file, options);
        console.log(`Compressed to: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
        return compressedFile;
    } catch (error) {
        console.error("Image compression failed, using original:", error);
        return file;
    }
};

export const triggerHaptic = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'success' | 'warning' | 'error' = 'light') => {
    // @ts-ignore
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
        if (['success', 'warning', 'error'].includes(style)) {
            tg.HapticFeedback.notificationOccurred(style);
        } else {
            tg.HapticFeedback.impactOccurred(style);
        }
    }
};
