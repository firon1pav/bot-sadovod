
import { api } from './api';
import { Plant } from '../types';

// Helper to convert Base64 string to Blob for FormData
const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};

const createFormData = (imageInput: string | File) => {
    const formData = new FormData();
    if (typeof imageInput === 'string') {
        const blob = base64ToBlob(imageInput);
        formData.append('photo', blob, 'plant.jpg');
    } else {
        formData.append('photo', imageInput);
    }
    return formData;
};

export const identifyPlant = async (imageInput: string | File) => {
    const formData = createFormData(imageInput);
    return await api.identifyPlant(formData);
};

export const diagnosePlant = async (imageInput: string | File) => {
    const formData = createFormData(imageInput);
    return await api.diagnosePlant(formData);
};

export const chatWithPlantExpert = async (message: string, plant: Plant) => {
    return await api.chatWithPlant(message, plant.id);
};
