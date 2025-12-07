
import { Plant, User, PlantLocation, PlantType, CareType } from '../types';

// @ts-ignore
const env = typeof import.meta !== 'undefined' ? import.meta.env : {};
const ENV_API_URL = env?.VITE_API_URL;
const IS_PROD = env?.PROD;

const BASE_URL = ENV_API_URL || (IS_PROD ? '/api' : 'http://localhost:3000/api');

const getHeaders = () => {
    // @ts-ignore
    const initData = window.Telegram?.WebApp?.initData || '';
    return {
        'Authorization': initData,
    };
};

const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d*)?(?:[-+]\d{2}:?\d{2}|Z)?$/;

const parseISOString = (key: string, value: any) => {
    if (typeof value === "string" && isoDateRegex.test(value)) {
        return new Date(value);
    }
    return value;
};

// Strict request handler - NO MOCKS
const request = async (endpoint: string, options: Omit<RequestInit, 'body'> & { body?: any } = {}) => {
    const headers = { ...getHeaders(), ...(options.headers as Record<string, string>) };
    
    if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
        if (typeof options.body === 'object') {
            options.body = JSON.stringify(options.body);
        }
    }

    const url = BASE_URL.startsWith('http') ? `${BASE_URL}${endpoint}` : `${window.location.origin}${BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, { ...options, headers, body: options.body as BodyInit });
        
        if (!response.ok) {
            // Attempt to get specific error message from backend JSON
            let errorMessage = `API Error: ${response.status}`;
            try {
                const errorBody = await response.json();
                if (errorBody && errorBody.error) errorMessage = errorBody.error;
            } catch (e) {}
            
            throw new Error(errorMessage);
        }

        // Handle empty responses (like 204 No Content)
        if (response.status === 204) return null;

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const text = await response.text();
            return JSON.parse(text, parseISOString);
        } else {
            return response.text();
        }
    } catch (error: any) {
        console.error(`[API] Request to ${endpoint} failed:`, error);
        // Strictly propagate error to UI. No fallback to demo data.
        throw error;
    }
};

export const api = {
    getPlants: (): Promise<Plant[]> => request('/plants'),
    getUserPlants: (userId: string): Promise<Plant[]> => request(`/users/${userId}/plants`),
    addPlant: (formData: FormData): Promise<Plant> => request('/plants', { method: 'POST', body: formData }),
    updatePlant: (plantId: string, data: Partial<Plant> | FormData): Promise<Plant> => request(`/plants/${plantId}`, { method: 'PATCH', body: data }),
    deletePlant: (plantId: string): Promise<void> => request(`/plants/${plantId}`, { method: 'DELETE' }),
    logCare: (plantId: string, type: string, note?: string) => request(`/plants/${plantId}/care`, { method: 'POST', body: { type, note } }),
    getTimelapse: (plantId: string): Promise<{ url: string, date: Date }[]> => request(`/plants/${plantId}/timelapse`), 

    getMarket: (): Promise<Plant[]> => request('/market'),
    checkWeather: (lat: number, lon: number): Promise<{ alert: string | null }> => request('/weather/check', { method: 'POST', body: { lat, lon } }),

    getProfile: (): Promise<User> => request('/profile'),
    getUser: (userId: string): Promise<User> => request(`/users/${userId}`),
    updateProfile: (data: Partial<User> | FormData) => request('/profile', { method: 'PUT', body: data }),
    deleteAccount: (): Promise<void> => request('/profile', { method: 'DELETE' }),
    completeQuest: (questId: string) => request(`/quests/${questId}/complete`, { method: 'POST' }),

    sendFriendRequest: (friendId: string) => request('/friends/request', { method: 'POST', body: { friendId } }),
    getFriendRequests: (): Promise<User[]> => request('/friends/requests'),
    respondToFriendRequest: (requestId: string, action: 'ACCEPT' | 'REJECT') => request('/friends/respond', { method: 'POST', body: { requestId, action } }),
    removeFriend: (friendId: string) => request(`/friends/${friendId}`, { method: 'DELETE' }),
    searchUsers: (query: string): Promise<User[]> => request(`/users/search?query=${encodeURIComponent(query)}`),

    identifyPlant: (formData: FormData) => request('/ai/identify', { method: 'POST', body: formData }),
    diagnosePlant: (formData: FormData) => request('/ai/diagnose', { method: 'POST', body: formData }),
    chatWithPlant: (message: string, plantId: string, history: any[] = []) => request('/ai/chat', { method: 'POST', body: { message, plantId, history } }),
};
