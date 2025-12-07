
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

// --- MOCK DATA FOR DEMO MODE ---

let MOCK_USER: User & { achievements: any[] } = {
    id: 'demo-user',
    name: 'Алексей Садовод',
    photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    gender: 'male',
    age: 28,
    about: 'Люблю редкие суккуленты и арочные растения. Живу в джунглях!',
    telegramUsername: '@alex_plants',
    friends: [],
    xp: 2650,
    level: 6,
    dailyQuests: [
        { id: 'q1', title: 'Утренняя роса', description: 'Опрыскайте 2 растения', xpReward: 15, isCompleted: false },
        { id: 'q2', title: 'Фотоотчет', description: 'Обновите фото Монстеры', xpReward: 30, isCompleted: true },
        { id: 'q3', title: 'Эксперт', description: 'Используйте AI диагностику', xpReward: 50, isCompleted: false },
    ],
    // Subscription Mock
    aiRequestsCount: 3,
    isSubscribed: false,
    achievements: []
};

let MOCK_PLANTS: Plant[] = [
    {
        id: 'p1',
        userId: 'demo-user',
        name: 'Монстера Альба',
        type: PlantType.FOLIAGE,
        location: PlantLocation.HOME,
        photoUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
        lastWateredAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
        wateringFrequencyDays: 7,
        createdAt: new Date(),
        nextFertilizingDate: new Date(Date.now() + 86400000 * 5),
        isSwapAvailable: false
    },
    {
        id: 'p2',
        userId: 'demo-user',
        name: 'Кактус Геннадий',
        type: PlantType.SUCCULENT,
        location: PlantLocation.OFFICE,
        photoUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=800&q=80',
        lastWateredAt: new Date(Date.now() - 86400000 * 12),
        wateringFrequencyDays: 14,
        createdAt: new Date(),
        nextRepottingDate: new Date(Date.now() - 86400000 * 5), // Overdue
        isSwapAvailable: true
    },
    {
        id: 'p3',
        userId: 'demo-user',
        name: 'Фикус Лирата',
        type: PlantType.FOLIAGE,
        location: PlantLocation.HOME,
        photoUrl: 'https://images.unsplash.com/photo-1597055181300-e30ba1540d6e?auto=format&fit=crop&w=800&q=80',
        lastWateredAt: new Date(Date.now() - 86400000 * 1),
        wateringFrequencyDays: 5,
        createdAt: new Date(),
        isGiveaway: false
    }
];

let MOCK_MARKET_ITEMS: Plant[] = [
    {
        id: 'm1',
        userId: 'u2',
        name: 'Черенок Монстеры Вариегатной',
        type: PlantType.FOLIAGE,
        location: PlantLocation.OTHER,
        photoUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
        lastWateredAt: new Date(),
        createdAt: new Date(),
        wateringFrequencyDays: 7,
        price: 1500,
        currency: 'RUB',
        city: 'Москва',
        description: 'Укорененный черенок с отличной генетикой. Уже есть новый рост.',
        isForSale: true,
        sellerTelegram: 'plant_queen_msk',
        sellerName: 'Виктория'
    },
    {
        id: 'm2',
        userId: 'u3',
        name: 'Фиалка (Сенполия)',
        type: PlantType.FLOWERING,
        location: PlantLocation.OTHER,
        photoUrl: 'https://images.unsplash.com/photo-1550953689-6014cd7c223c?auto=format&fit=crop&w=800&q=80',
        lastWateredAt: new Date(),
        createdAt: new Date(),
        wateringFrequencyDays: 3,
        price: 0,
        currency: 'RUB',
        city: 'Санкт-Петербург',
        description: 'Отдам даром в добрые руки. Цветёт фиолетовым, очень неприхотлива.',
        isForSale: true,
        sellerTelegram: 'flower_spb_free',
        sellerName: 'Елена'
    },
    {
        id: 'm3',
        userId: 'u4',
        name: 'Замиокулькас (Долларовое дерево)',
        type: PlantType.FOLIAGE,
        location: PlantLocation.OTHER,
        photoUrl: 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&w=800&q=80',
        lastWateredAt: new Date(),
        createdAt: new Date(),
        wateringFrequencyDays: 14,
        price: 500,
        currency: 'RUB',
        city: 'Казань',
        description: 'Взрослое растение, высота 40см. Продаю вместе с горшком.',
        isForSale: true,
        sellerTelegram: 'kazan_plants',
        sellerName: 'Руслан'
    },
    {
        id: 'm4',
        userId: 'u5',
        name: 'Алоэ Вера',
        type: PlantType.SUCCULENT,
        location: PlantLocation.OTHER,
        photoUrl: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=800&q=80',
        lastWateredAt: new Date(),
        createdAt: new Date(),
        wateringFrequencyDays: 10,
        price: 150,
        currency: 'RUB',
        city: 'Москва',
        description: 'Лечебный алоэ, детки. Цена за штуку.',
        isForSale: true,
        sellerTelegram: 'aloe_shop',
        sellerName: 'Магазин "Колючка"'
    }
];

// Helper to handle offline/demo mode by intercepting failed requests
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
            // Attempt to get error message
            let errorMessage = `API Error: ${response.status}`;
            try {
                const errorBody = await response.json();
                if (errorBody && errorBody.error) errorMessage = errorBody.error;
            } catch (e) {}
            
            // Fallback on 404 or network error
            if (response.status === 404 || response.status === 0 || response.status >= 500) {
                throw new Error("Backend unavailable");
            }
            throw new Error(errorMessage);
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const text = await response.text();
            return JSON.parse(text, parseISOString);
        } else {
            return response.text();
        }
    } catch (error: any) {
        // Skip fallback if specific error logic
        if (error.message && (error.message.includes("Limit") || error.message.includes("Payment"))) {
            throw error; 
        }

        console.warn(`[API] Network Request to ${endpoint} failed. Switching to DEMO MODE data.`);
        
        // --- DEMO MODE HANDLERS ---
        
        await new Promise(resolve => setTimeout(resolve, 600));

        if (endpoint === '/profile') {
            return MOCK_USER;
        }
        
        if (endpoint === '/plants') {
            if (options.method === 'POST') {
                const body = options.body instanceof FormData ? Object.fromEntries(options.body) : JSON.parse(options.body);
                const isForSale = body.isForSale === 'true' || body.isForSale === true;
                
                const newPlant: Plant = {
                    id: `local-${Date.now()}`,
                    userId: MOCK_USER.id,
                    name: body.name || 'Новое растение',
                    type: body.type || PlantType.FOLIAGE,
                    location: body.location || PlantLocation.HOME,
                    customLocation: body.customLocation,
                    customType: body.customType,
                    wateringFrequencyDays: Number(body.wateringFrequencyDays) || 7,
                    lastWateredAt: body.lastWateredAt ? new Date(body.lastWateredAt) : new Date(),
                    createdAt: new Date(),
                    photoUrl: 'https://placehold.co/400?text=New+Plant',
                    
                    isForSale: isForSale,
                    price: body.price ? Number(body.price) : undefined,
                    city: body.city,
                    description: body.description,
                    sellerName: MOCK_USER.name,
                    sellerTelegram: MOCK_USER.telegramUsername,
                    sellerPhotoUrl: MOCK_USER.photoUrl
                };
                
                if (isForSale) {
                    MOCK_MARKET_ITEMS = [newPlant, ...MOCK_MARKET_ITEMS];
                    // Demo Logic: Unlock "Entrepreneur" achievement
                    const hasAch = MOCK_USER.achievements.find((a: any) => a.code === 'FIRST_LISTING');
                    if (!hasAch) {
                        MOCK_USER.achievements.push({ code: 'FIRST_LISTING', earnedAt: new Date() });
                    }
                } else {
                    MOCK_PLANTS = [newPlant, ...MOCK_PLANTS];
                }
                return newPlant;
            }
            return MOCK_PLANTS;
        }

        if (endpoint.includes('/care') && options.method === 'POST') {
            const plantId = endpoint.split('/')[2];
            const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
            
            const plantIndex = MOCK_PLANTS.findIndex(p => p.id === plantId);
            if (plantIndex !== -1) {
                const plant = { ...MOCK_PLANTS[plantIndex] };
                const now = new Date();
                
                if (body.type === CareType.WATER) plant.lastWateredAt = now;
                if (body.type === CareType.FERTILIZE) plant.lastFertilizedAt = now;
                if (body.type === CareType.REPOT) plant.lastRepottedAt = now;
                if (body.type === CareType.TRIM) plant.lastTrimmedAt = now;

                MOCK_PLANTS[plantIndex] = plant;

                if (MOCK_USER.xp === undefined) MOCK_USER.xp = 0;
                MOCK_USER.xp += 10;

                return {
                    updatedPlant: plant,
                    userStats: { xp: MOCK_USER.xp, level: MOCK_USER.level, leveledUp: false },
                    xpGained: 10,
                    newAchievements: []
                };
            }
        }

        if (endpoint === '/market') return MOCK_MARKET_ITEMS;
        if (endpoint === '/friends/requests') return [];
        if (endpoint === '/weather/check') return { alert: "Демо-режим: Погода отличная! (Симуляция)" };

        if (endpoint.includes('/payment/create')) {
            // Mock Payment Link creation
            // In demo mode, we just auto-upgrade the user for testing
            MOCK_USER.isSubscribed = true;
            return { paymentUrl: "#", demoSuccess: true };
        }

        if (endpoint.includes('/ai/')) {
            // Check limits in Demo Mode
            if (!MOCK_USER.isSubscribed && MOCK_USER.aiRequestsCount >= 10) {
                throw new Error("Limit reached");
            }
            
            // Increment
            MOCK_USER.aiRequestsCount += 1;

            if (endpoint.includes('chat')) return "Это демо-ответ от AI. В реальной версии я бы рассказал вам все о вашем растении!";
            if (endpoint.includes('diagnose')) return "В демо-режиме диагностика недоступна, но обычно я определяю болезни с точностью до 95%!";
            if (endpoint.includes('identify')) return { name: "Тестовое растение", type: "FOLIAGE", wateringFrequencyDays: 7 };
        }

        if (endpoint.includes('/complete') && options.method === 'POST') {
             // Mock Quest Completion
             const questId = endpoint.split('/')[2];
             const q = MOCK_USER.dailyQuests?.find((q: any) => q.id === questId);
             if (q) {
                 q.isCompleted = true;
                 if (MOCK_USER.xp) MOCK_USER.xp += q.xpReward;
                 return { success: true, xpGained: q.xpReward };
             }
        }

        if (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE' || options.method === 'PATCH') {
            return { success: true };
        }

        return null;
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

    createPayment: () => request('/payment/create', { method: 'POST' }),
};
