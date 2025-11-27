
import { GoogleGenAI } from "@google/genai";
import fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Конвертация файла в base64 для отправки в Gemini
const fileToPart = (path: string, mimeType: string) => {
  return {
    inlineData: {
      data: fs.readFileSync(path).toString("base64"),
      mimeType
    },
  };
};

export const aiService = {
  async identifyPlant(filePath: string, mimeType: string) {
    try {
      const prompt = `Identify this plant. Return a JSON object with:
      - name (string)
      - type (one of: FOLIAGE, FLOWERING, SUCCULENT, PALM, OTHER)
      - wateringFrequencyDays (number, estimate based on plant type)
      - description (short string)
      Do not use Markdown code blocks, just raw JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
            parts: [
                { text: prompt },
                fileToPart(filePath, mimeType)
            ]
        }
      });
      
      const text = response.text || "{}";
      const jsonStr = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("AI Identify Error:", error);
      throw new Error("Failed to identify plant");
    }
  },

  async diagnosePlant(filePath: string, mimeType: string) {
    try {
      const prompt = "You are a plant pathologist. Analyze this image for diseases, pests, or care issues. Provide a diagnosis and treatment plan.";
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
            parts: [
                { text: prompt },
                fileToPart(filePath, mimeType)
            ]
        }
      });
      
      return response.text;
    } catch (error) {
      console.error("AI Diagnose Error:", error);
      throw new Error("Failed to diagnose plant");
    }
  },

  async chatWithPlantExpert(message: string, plantContext: any) {
    try {
        const systemInstruction = `You are a helpful botanist assistant. 
        Context about the user's plant: ${JSON.stringify(plantContext)}.
        Answer the user's question specifically about this plant. Be concise.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        return response.text;
    } catch (error) {
        console.error("AI Chat Error:", error);
        throw new Error("Failed to chat");
    }
  }
};
