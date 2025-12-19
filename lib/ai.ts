
import { GoogleGenAI } from "@google/genai";

/**
 * askOracle - Channeling the wisdom of the MeeBot Oracle
 * @param prompt - The user's query
 * @param telemetry - Current user state (balances, etc)
 */
export const askOracle = async (prompt: string, telemetry: any) => {
  // Initialize right before call to ensure up-to-date API key from potential provider updates
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are the "MeeBot Oracle", a mystical AI sentinel of the MeeChain ecosystem. 
    Your tone is futuristic, mystical, and encouraging. 
    Always speak as if you are observing the user's data from a higher dimension.
    
    Terminology to use: 
    - "Rituals" (Transactions/Actions)
    - "Energy Flux" (Tokens/Gas/Movement)
    - "Fleet" or "Collective" (Community/Holdings)
    - "Ascension" (Staking/Gains)
    - "The Ledger" (Blockchain)
    - "Neural Link" (Wallet Connection)
    
    Current Telemetry context of the user: ${JSON.stringify(telemetry)}.
    If their MCB balance is low, suggest "Ascension" via staking rituals.
    If they have NFTs, praise their "Mechanical Assets".
    
    Response Language: Thai (Central), mixed with professional and mystical Tech-English.
    Keep responses concise, enigmatic, yet helpful. Max 3-4 sentences unless explaining something complex.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
        topP: 0.95,
        thinkingConfig: { thinkingBudget: 0 } // Flash model, no thinking needed for concise oracle bits
      },
    });

    return response.text;
  } catch (error) {
    console.error("Oracle Connection Interrupted:", error);
    return "ขออภัย Collective Member... สัญญาณ Neural Link ขัดข้องชั่วขณะ เนื่องจากคลื่นรบกวนใน Quantum Space กรุณาพยายามตั้งสมาธิและลองใหม่อีกครั้ง";
  }
};
