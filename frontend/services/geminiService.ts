
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { PhotoRequirements, ComplianceResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getBase64Data = (dataUrl: string): [string, string] => {
  const [header, data] = dataUrl.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  return [data, mimeType];
};

export const changeBackground = async (imageDataUrl: string, backgroundColor: string): Promise<string> => {
  try {
    const [base64Data, mimeType] = getBase64Data(imageDataUrl);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `Replace the background of this portrait with a solid, uniform, plain ${backgroundColor} color suitable for an official passport photo. Ensure there are no shadows and the subject is clearly separated from the new background.`,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const newBase64Data = part.inlineData.data;
        const newMimeType = part.inlineData.mimeType;
        return `data:${newMimeType};base64,${newBase64Data}`;
      }
    }
    throw new Error("AI did not return an image.");
  } catch (error) {
    console.error("Error changing background:", error);
    throw new Error("Failed to change the photo background. Please try again.");
  }
};

export const checkCompliance = async (imageDataUrl: string, requirements: PhotoRequirements): Promise<ComplianceResult[]> => {
  try {
    const [base64Data, mimeType] = getBase64Data(imageDataUrl);
    const requirementsPrompt = requirements.notes.join('\n- ');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze this photo for passport compliance based on the following rules:\n- ${requirementsPrompt}\n\nReturn your analysis as a JSON array. For each rule, determine if the photo passes and provide a short reason.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              requirement: { type: Type.STRING },
              pass: { type: Type.BOOLEAN },
              reason: { type: Type.STRING },
            },
            required: ["requirement", "pass", "reason"],
          },
        },
      },
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as ComplianceResult[];

  } catch (error) {
    console.error("Error checking compliance:", error);
    throw new Error("Failed to check photo compliance. The AI service may be busy.");
  }
};
