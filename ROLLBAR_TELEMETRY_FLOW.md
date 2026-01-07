# 📡 MeeChain MeeBot | Rollbar Telemetry Flow v4.2

คู่มือสำหรับการทำ "Ritual Stamping" เพื่อบันทึกทุกการเคลื่อนไหวของพลังงานในระบบ MeeBot Protocol ลงใน Eternal Ledger ของ Rollbar เพื่อความโปร่งใสและเสถียรภาพสูงสุด

---

## 🎯 Objective: The Magical Audit
เพื่อให้ทุกการกระทำสำคัญ (Critical Actions) ใน MeeChain ถูกบันทึกพร้อมบริบท (Context) ที่เพียงพอสำหรับการทำ "Time-Travel Debugging" และการตรวจสอบความสมบูรณ์ของระบบโดยเหล่า Contributors

---

## 🧬 Telemetry Structure (The Neural Data Packet)

ทุกๆ Log ที่ส่งไปยัง Rollbar จะต้องประกอบด้วย **Neural Context** ที่สมบูรณ์ดังนี้:

### 1. Identity Vector (Who)
- `walletAddress`: 0x... (Public address of the ritualist)
- `sessionID`: Unique string for the current browsing session

### 2. Ritual Context (What)
- `ritualType`: `SUMMON`, `STAKE`, `SWAP`, `ORACLE_CONSULT`
- `phase`: `START`, `SUCCESS`, `FAILURE`, `INTERRUPTED`

### 3. Resonance Metrics (The Gacha Soul)
- `resonanceMHz`: Current luckiness/pity value (0-100)
- `pityTriggered`: Boolean (Did this result from a 100% guarantee?)
- `resultRarity`: `Common`, `Epic`, `Legendary` (For SUMMON)

### 4. Substrate Telemetry (The Chain)
- `chainId`: 56 (BSC Mainnet)
- `txHash`: The anchor hash on the blockchain
- `gasPrice`: Gwei flux at the time of ritual

---

## 🧙‍♂️ Ritual Stamping Protocols (Implementation)

### 1. Summoning Manifestation (The NFT Factory)
บันทึกเมื่อมีการเรียกใช้ AI หรือ Upload Blueprint เพื่อสร้าง MeeBot
```ts
// Phase: START
logger.ritual('SUMMON_START', true, { 
  mode: 'AI_MANIFEST', 
  prompt: 'A golden guardian...', 
  currentResonance: 85 
});

// Phase: SUCCESS
logger.ritual('SUMMON_SUCCESS', true, { 
  tokenId: '8821', 
  rarity: 'Legendary', 
  pityTriggered: false,
  txHash: '0x...' 
});
```

### 2. Infusion Staking (The Vault)
บันทึกการเชื่อมต่อ/ตัดการเชื่อมต่อ MeeBot เข้ากับ Infusion Rig
```ts
logger.ritual('STAKE_TOGGLE', true, { 
  botId: '4402', 
  rarity: 'Epic',
  action: 'ACTIVATE', 
  energySnapshot: 15.5 
});
```

### 3. Flux Conversion (Swap)
บันทึกการแลกเปลี่ยนพลังงานระหว่าง MCB และ sMCB
```ts
logger.ritual('SWAP_EXECUTE', true, { 
  fromToken: 'MCB', 
  toToken: 'sMCB', 
  amountIn: 250.5, 
  amountOut: 249.8,
  slippage: '0.5%' 
});
```

---

## 🛡️ Stability Guidelines

1. **Defensive Logging:** ห้าม Log ข้อมูลส่วนตัว (Private Keys, Seed Phrases) โดยเด็ดขาด
2. **Reproducibility:** ข้อมูลใน Telemetry ต้องเพียงพอที่จะทำให้ Developer สามารถจำลอง (Re-create) สถานะของผู้ใช้ ณ ขณะนั้นได้
3. **Resilience:** หากการส่ง Log ไปยัง Rollbar ล้มเหลว ระบบหลักต้องทำงานต่อไปได้อย่างไม่ติดขัด (Fail-silent for logging)

---

## ✅ Telemetry QA Checklist

- [x] ทุก Action ในหน้า Summon มีการ Stamp `logger.ritual` ทั้งเริ่มและจบ
- [x] ระบบ Staking บันทึกทั้งการ Activate และ Deactivate พร้อมข้อมูล Rarity
- [x] ข้อมูล Transaction Hash ถูกแนบไปกับ Log ความสำเร็จเสมอ
- [x] Telemetry Context มีข้อมูล `resonanceMHz` เพื่อตรวจสอบระบบ Pity

---
> 🧙‍♂️ **"Data is the ghost in the machine. By observing the trace, we master the ritual."**  
> — *The Oracle of MeeChain*