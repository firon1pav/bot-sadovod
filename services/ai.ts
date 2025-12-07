
import { api } from './api';
import { Plant } from '../types';

/**
 * Helper to convert various image inputs (File, Blob URL, Base64) into FormData
 * ready for backend upload.
 */
const createFormData = async (imageInput: string | File): Promise<FormData> => {
    const formData = new FormData();
    let blob: Blob;

    try {
        if (imageInput instanceof File) {
            blob = imageInput;
        } else if (typeof imageInput === 'string') {
            // Check if it's a Blob URL (preview) or HTTP URL
            const response = await fetch(imageInput);
            blob = await response.blob();
        } else {
            throw new Error("Неизвестный формат изображения");
        }

        // 'photo' matches the upload.single('photo') middleware on backend
        formData.append('photo', blob, 'image.jpg');
    } catch (e) {
        console.error("Error processing image for AI:", e);
        throw new Error("Не удалось обработать изображение для отправки.");
    }

    return formData;
};

/**
 * Sends image to backend for plant identification.
 */
export const identifyPlant = async (imageInput: string | File) => {
    const formData = await createFormData(imageInput);
    // Calls POST /api/ai/identify
    return await api.identifyPlant(formData);
};

/**
 * Sends image to backend for plant pathology diagnosis.
 */
export const diagnosePlant = async (imageInput: string | File) => {
    const formData = await createFormData(imageInput);
    // Calls POST /api/ai/diagnose
    return await api.diagnosePlant(formData);
};

/**
 * Sends message to backend for chat.
 */
export const chatWithPlantExpert = async (message: string, plant: Plant) => {
    return await api.chatWithPlant(message, plant.id, []); 
};
