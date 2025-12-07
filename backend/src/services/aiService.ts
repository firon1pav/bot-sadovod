
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Singleton instance variable
let aiInstance: OpenAI | null = null;

// Helper to get AI instance safely using Singleton pattern
const getAiInstance = () => {
    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is missing in environment variables");
    }
    if (!aiInstance) {
        aiInstance = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
            defaultHeaders: {
                "HTTP-Referer": "https://botgardener.app", // Optional: for OpenRouter rankings
                "X-Title": "BotGardener", // Optional: for OpenRouter rankings
            }
        });
    }
    return aiInstance;
};

// Конвертация файла в base64 Data URI для OpenAI API
const fileToDataUri = async (filePath: string, mimeType: string) => {
  const data = await fs.promises.readFile(filePath);
  const base64 = data.toString("base64");
  return `data:${mimeType};base64,${base64}`;
};

const MODEL_NAME = process.env.AI_MODEL || "google/gemini-2.0-flash-001";

export const aiService = {
  async identifyPlant(filePath: string, mimeType: string) {
    try {
      const ai = getAiInstance();
      // Prompt for plant identification
      const prompt = `Определи, что это за растение на фото. Верни ТОЛЬКО валидный JSON объект (без markdown блоков \`\`\`json) со следующими полями:
      {
        "name": "Название растения на русском языке",
        "type": "Одно из: FOLIAGE, FLOWERING, SUCCULENT, PALM, OTHER",
        "wateringFrequencyDays": 7 (число, частота полива в днях),
        "description": "Краткое описание на русском (1-2 предложения)"
      }`;

      const dataUri = await fileToDataUri(filePath, mimeType);

      const response = await ai.chat.completions.create({
        model: MODEL_NAME,
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: dataUri } }
                ]
            }
        ],
        response_format: { type: "json_object" } // Force JSON mode if model supports it
      });
      
      const text = response.choices[0].message.content || "{}";
      
      // Robust JSON extraction
      let jsonStr = text;
      // Strip markdown code blocks just in case
      jsonStr = jsonStr.replace(/```json\n?|```/g, '').trim();
      
      const start = jsonStr.indexOf('{');
      const end = jsonStr.lastIndexOf('}');
      
      if (start !== -1 && end !== -1 && end > start) {
          jsonStr = jsonStr.substring(start, end + 1);
          try {
              return JSON.parse(jsonStr);
          } catch (e) {
              console.error("JSON Parse Error (Inner):", e);
              throw new Error("AI вернул некорректный JSON");
          }
      }
      
      console.warn("AI Response was not JSON:", text);
      throw new Error("Не удалось разобрать ответ от AI");

    } catch (error) {
      console.error("AI Identify Error:", error);
      throw new Error("Ошибка определения растения");
    }
  },

  async diagnosePlant(filePath: string, mimeType: string) {
    try {
      const ai = getAiInstance();
      const prompt = `Роль: Ты профессиональный агроном и фитопатолог.
      Задача: Проанализируй фото растения.
      
      1. Диагностика: Есть ли признаки болезней (пятна, гниль, налет), вредителей или ошибок ухода (перелив, засуха, ожоги)?
      2. Вердикт: Если растение здорово, напиши это.
      3. Лечение: Дай пошаговый план действий (чем обработать, как изменить полив/свет).
      
      Отвечай ТОЛЬКО НА РУССКОМ ЯЗЫКЕ. Иcпользуй Markdown для форматирования.`;
      
      const dataUri = await fileToDataUri(filePath, mimeType);

      const response = await ai.chat.completions.create({
        model: MODEL_NAME,
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: dataUri } }
                ]
            }
        ]
      });
      
      return response.choices[0].message.content || "Не удалось получить диагноз.";
    } catch (error) {
      console.error("AI Diagnose Error:", error);
      throw new Error("Ошибка диагностики");
    }
  },

  async chatWithPlantExpert(message: string, plantContext: any, history: any[] = []) {
    try {
        const ai = getAiInstance();
        
        const systemInstruction = `Ты дружелюбный и опытный помощник-ботаник в приложении BotGardener.
        Контекст о растении пользователя: ${JSON.stringify(plantContext)}.
        Отвечай на вопросы пользователя конкретно об этом растении. 
        Твои ответы должны быть СТРОГО НА РУССКОМ ЯЗЫКЕ, полезными, краткими и поддерживающими.`;

        // Map internal history to OpenAI format
        const openAiHistory = history.slice(-10).map((msg: any) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant', // Map 'ai' -> 'assistant'
            content: msg.text
        }));

        const messages: any[] = [
            { role: "system", content: systemInstruction },
            ...openAiHistory,
            { role: "user", content: message }
        ];

        const response = await ai.chat.completions.create({
            model: MODEL_NAME,
            messages: messages,
        });

        return response.choices[0].message.content || "Извините, я задумался.";
    } catch (error) {
        console.error("AI Chat Error:", error);
        throw new Error("Ошибка чата");
    }
  }
};
