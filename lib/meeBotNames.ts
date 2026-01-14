/**
 * MeeBot Name Generation Utility (Deterministic Version)
 * มั่นใจได้ว่า ID เดิมจะได้ชื่อเดิมเสมอ ไม่ว่าจะรีเฟรชกี่ครั้ง
 */

const prefixes = [
  "Alpha", "Zeta", "Nova", "Orion", "Titan", 
  "Celestial", "Astra", "Nebula", "Lotus", "Dragon",
  "Quantum", "Mecha", "Solar", "Void", "Eternal",
  "Spectral", "Neon", "Cyber", "Aether", "Giga"
];

const suffixes = [
  "Core", "Prime", "Flux", "Pulse", "Sentinel", 
  "Phantom", "Legend", "Spirit", "Soul", "Monk",
  "Guardian", "Prophet", "Vanguard", "Catalyst", "Engine",
  "Protocol", "Unit", "Dread", "Sovereign", "Shadow"
];

/**
 * Generates a consistent mystical name based on the unique ID.
 * @param id - The unique identifier (tokenId)
 */
export const generateMeeBotName = (id: string): string => {
  if (!id) return "Unknown-Unit";

  // 1. สร้างค่าตัวเลขคงที่จาก String ID (Hashing)
  const seed = id.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  // 2. เลือก Prefix และ Suffix โดยใช้ Modulo (%) กับค่า Seed
  // ใช้สูตรคณิตศาสตร์ต่างกันเล็กน้อยเพื่อให้ Prefix และ Suffix ไม่ซ้ำทางกัน
  const prefixIndex = seed % prefixes.length;
  const suffixIndex = (seed * 7 + 13) % suffixes.length; 

  const prefix = prefixes[prefixIndex];
  const suffix = suffixes[suffixIndex];

  return `${prefix}-${suffix}-${id}`;
};