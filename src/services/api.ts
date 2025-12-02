
import { Plant, User, Community, CommunityPost, Comment } from '../types';

// --- Dynamic URL Resolution ---
// 1. Priority: Explicit VITE_API_URL from .env file
// 2. Fallback (Production): '/api' (Relative path, assumes frontend and backend are on the same domain)
// 3. Fallback (Development): 'http://localhost:3000/api'

// @ts-ignore
const ENV_API_URL = import.meta.env.VITE_API_URL;
// @ts-ignore
const IS_PROD = import.meta.env.PROD;

const BASE_URL = ENV_API_URL || (IS_PROD ? '/api' : 'http://localhost:3000/api');

console.log('API Configured at:', BASE_URL);

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

const request = async (endpoint: string, options: Omit<RequestInit, 'body'> & { body?: any } = {}) => {
    const headers = { ...getHeaders(), ...(options.headers as Record<string, string>) };
    
    if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
        if (typeof options.body === 'object') {
            options.body = JSON.stringify(options.body);
        }
    }

    // Handle relative URLs correctly if BASE_URL is just '/api'
    const url = BASE_URL.startsWith('http') 
        ? `${BASE_URL}${endpoint}` 
        : `${window.location.origin}${BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            body: options.body as BodyInit,
        });

        if (!response.ok) {
            let errorMessage = `API Error: ${response.status} ${response.statusText}`;
            try {
                // Try to parse the error message from the backend JSON
                const errorBody = await response.json();
                if (errorBody && errorBody.error) {
                    errorMessage = errorBody.error;
                }
            } catch (e) {
                // Response was not JSON, stick to the generic message
            }
            throw new Error(errorMessage);
        }

        // Handle text responses (like from AI diagnose/chat) or JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const text = await response.text();
            return JSON.parse(text, parseISOString);
        } else {
            return response.text();
        }
    } catch (error: any) {
        // Re-throw the error so the caller handles it
        console.error(`Request failed to ${endpoint}:`, error.message);
        throw error;
    }
};

export const api = {
    // Plants
    getPlants: (): Promise<Plant[]> => request('/plants'),
    getUserPlants: (userId: string): Promise<Plant[]> => request(`/users/${userId}/plants`),
    
    addPlant: (formData: FormData): Promise<Plant> => request('/plants', {
        method: 'POST',
        body: formData
    }),
    
    updatePlant: (plantId: string, data: Partial<Plant> | FormData): Promise<Plant> => request(`/plants/${plantId}`, {
        method: 'PATCH',
        body: data
    }),

    deletePlant: (plantId: string): Promise<void> => request(`/plants/${plantId}`, {
        method: 'DELETE'
    }),

    logCare: (plantId: string, type: string, note?: string) => request(`/plants/${plantId}/care`, {
        method: 'POST',
        body: { type, note }
    }),

    // User
    getProfile: (): Promise<User & { stats: any }> => request('/profile'),
    updateProfile: (data: Partial<User> | FormData) => request('/profile', {
        method: 'PUT',
        body: data
    }),
    
    // Friend Requests System
    sendFriendRequest: (friendId: string) => request('/friends/request', {
        method: 'POST',
        body: { friendId }
    }),
    getFriendRequests: (): Promise<User[]> => request('/friends/requests'),
    respondToFriendRequest: (requestId: string, action: 'ACCEPT' | 'REJECT') => request('/friends/respond', {
        method: 'POST',
        body: { requestId, action }
    }),
    removeFriend: (friendId: string) => request(`/friends/${friendId}`, {
        method: 'DELETE'
    }),
    
    searchUsers: (query: string): Promise<User[]> => request(`/users/search?query=${encodeURIComponent(query)}`),

    // Communities
    getCommunities: (query?: string): Promise<Community[]> => {
        const url = query ? `/communities?query=${encodeURIComponent(query)}` : '/communities';
        return request(url);
    },
    joinCommunity: (id: string) => request(`/communities/${id}/join`, { method: 'POST' }),
    leaveCommunity: (id: string) => request(`/communities/${id}/leave`, { method: 'POST' }),
    createCommunity: (formData: FormData): Promise<Community> => request('/communities', {
        method: 'POST',
        body: formData
    }),
    
    // Posts
    getPosts: (communityId: string): Promise<CommunityPost[]> => request(`/communities/${communityId}/posts`),
    createPost: (communityId: string, formData: FormData): Promise<CommunityPost> => request(`/communities/${communityId}/posts`, {
        method: 'POST',
        body: formData
    }),
    updatePost: (postId: string, formData: FormData): Promise<CommunityPost> => request(`/posts/${postId}`, {
        method: 'PATCH',
        body: formData
    }),
    deletePost: (postId: string) => request(`/posts/${postId}`, {
        method: 'DELETE'
    }),
    toggleLike: (postId: string): Promise<{ liked: boolean }> => request(`/posts/${postId}/like`, {
        method: 'POST'
    }),

    // Comments
    getComments: (postId: string): Promise<Comment[]> => request(`/posts/${postId}/comments`),
    addComment: (postId: string, text: string): Promise<Comment> => request(`/posts/${postId}/comments`, {
        method: 'POST',
        body: { text }
    }),

    // AI
    identifyPlant: (formData: FormData) => request('/ai/identify', {
        method: 'POST',
        body: formData
    }),
    diagnosePlant: (formData: FormData) => request('/ai/diagnose', {
        method: 'POST',
        body: formData
    }),
    chatWithPlant: (message: string, plantId: string) => request('/ai/chat', {
        method: 'POST',
        body: { message, plantId }
    })
};
