/**
 * MeeBot Identity System
 * ระบบสร้างชื่อและจัดระดับความหายากแบบคงที่ (Deterministic)
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
 * 1. สร้างชื่อที่คงที่ตาม ID
 */
export const generateMeeBotName = (id: string): string => {
  if (!id) return "Unknown-Unit";
  const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const prefixIndex = seed % prefixes.length;
  const suffixIndex = (seed * 13 + 7) % suffixes.length; 

  return `${prefixes[prefixIndex]}-${suffixes[suffixIndex]}-${id}`;
};

/**
 * 2. คำนวณความหายากและสีสันจากชื่อ
 */
export const getMeeBotRarity = (name: string) => {
  const n = name.toUpperCase();
  
  // ระดับ Legendary (สีทอง/ส้ม)
  if (n.includes("CELESTIAL") || n.includes("ETERNAL") || n.includes("GIGA") || n.includes("SOVEREIGN")) {
    return {
      label: "LEGENDARY",
      color: "#f59e0b", // Amber 500
      bg: "rgba(245, 158, 11, 0.1)",
      glow: "0 0 20px rgba(245, 158, 11, 0.4)"
    };
  }
  
  // ระดับ Epic (สีม่วง)
  if (n.includes("QUANTUM") || n.includes("VOID") || n.includes("NEBULA") || n.includes("PHANTOM")) {
    return {
      label: "EPIC",
      color: "#818cf8", // Indigo 400
      bg: "rgba(129, 140, 248, 0.1)",
      glow: "0 0 20px rgba(129, 140, 248, 0.4)"
    };
  }
  
  // ระดับ Rare (สีฟ้า)
  if (n.includes("NOVA") || n.includes("SPECTRAL") || n.includes("FLUX")) {
    return {
      label: "RARE",
      color: "#22d3ee", // Cyan 400
      bg: "rgba(34, 211, 238, 0.1)",
      glow: "0 0 15px rgba(34, 211, 238, 0.3)"
    };
  }

  // ระดับ Common (สีเขียว/เทา)
  return {
    label: "COMMON",
    color: "#94a3b8", // Slate 400
    bg: "rgba(148, 163, 184, 0.05)",
    glow: "none"
  };
};