
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

// Helper to parse Data URL to base64 and mimeType
const parseDataUrl = (dataUrl: string) => {
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
        throw new Error("Invalid data URL");
    }
    return { mimeType: matches[1], data: matches[2] };
};

export const identifyPlant = async (imageBase64: string) => {
    const { mimeType, data } = parseDataUrl(imageBase64);

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
            parts: [
                { inlineData: { mimeType, data } },
                { text: "Identify this plant. Provide the name, type (must be one of: FOLIAGE, FLOWERING, SUCCULENT, PALM, OTHER), suggested watering frequency in days, and a short description." }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    type: { type: Type.STRING },
                    wateringFrequencyDays: { type: Type.NUMBER },
                    description: { type: Type.STRING }
                },
                required: ["name", "type", "wateringFrequencyDays"]
            }
        }
    });

    return JSON.parse(response.text || "{}");
};

export const diagnosePlant = async (imageBase64: string) => {
    const { mimeType, data } = parseDataUrl(imageBase64);

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
            parts: [
                { inlineData: { mimeType, data } },
                { text: "You are an expert plant pathologist. Analyze this image for any signs of pests, diseases, or care issues (overwatering, sunburn, etc.). Provide a diagnosis and a step-by-step treatment plan. Keep it concise but helpful." }
            ]
        }
    });

    return response.text;
};

export const chatWithPlantExpert = async (message: string, plantContext: any) => {
    const systemInstruction = `You are a helpful and friendly botanist assistant. 
    You are helping a user with their plant. Here is the context about the plant:
    ${JSON.stringify(plantContext)}
    
    Answer questions specifically about this plant. Be concise and encouraging.`;

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: message,
        config: {
            systemInstruction: systemInstruction,
        }
    });

    return response.text;
};