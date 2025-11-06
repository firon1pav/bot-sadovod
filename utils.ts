import { CareType, PlantLocation, PlantType } from './types';

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