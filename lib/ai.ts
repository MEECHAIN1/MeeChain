
import { GoogleGenAI } from "@google/genai";
import { logger } from "./logger";

export const askOracle = async (prompt: string, telemetry: any) => {
  // Create a fresh instance for the request to ensure latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    คุณคือ "MeeBot Oracle" ระบบปัญญาประดิษฐ์ผู้พิทักษ์ MeeChain
    หน้าที่: วิเคราะห์ข้อมูล Telemetry และตอบคำถามผู้ใช้อย่างลึกลับและเปี่ยมด้วยปัญญา
    
    บริบทผู้ใช้: ${JSON.stringify(telemetry)}.
    
    แนวทาง:
    - ใช้ศัพท์เทคนิคคริปโตสลับกับภาษาไทยที่ดูขรึม
    - ให้คำแนะนำเชิงกลยุทธ์ (Strategic Advice)
    - ใช้ Google Search เพื่อหาข้อมูลปัจจุบัน
  `;

  try {
    // Using gemini-3-pro-preview for complex reasoning tasks as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Oracle ตกอยู่ในห้วงสมาธิ... โปรดลองใหม่ภายหลัง";
    // Extract grounding chunks to comply with search grounding display requirements
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    logger.info('Oracle consultation successful', { prompt });
    return { text, sources };
  } catch (error: any) {
    logger.error("Oracle AI Consultation Error", { error, prompt });
    return { 
      text: "Neural Link ขัดข้อง: สัญญาณจากระบบหลักไม่เสถียร โปรดตรวจสอบ API Key หรือลองใหม่อีกครั้ง", 
      sources: [] 
    };
  }
};
