
import { GoogleGenAI } from "@google/genai";
import { logger } from "./logger";

export const askOracle = async (prompt: string, telemetry: any) => {
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
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        temperature: 0.8,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Oracle ตกอยู่ในห้วงสมาธิ... โปรดลองใหม่ภายหลัง";
    logger.info('Oracle consultation successful', { prompt });
    return text;
  } catch (error: any) {
    logger.error("Oracle AI Consultation Error", { error, prompt });
    return "Neural Link ขัดข้อง: สัญญาณจากระบบหลักไม่เสถียร โปรดตรวจสอบ API Key หรือลองใหม่อีกครั้ง";
  }
};
