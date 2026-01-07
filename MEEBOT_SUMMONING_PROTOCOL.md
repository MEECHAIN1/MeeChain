# 🌀 MeeBot Summoning Protocol (MSP-01)

เอกสารฉบับนี้กำหนดกลไกทางเทคนิคของพิธีกรรม "Summoning" เพื่อความแม่นยำและความลึกลับ

---

## 🧬 Protocol Stages

### 1. Resonance Calibration (Preparation)
- ระบบตรวจสอบยอด Gems ใน Vessel
- คำนวณค่า Resonance Bonus (Pity) จาก `state.balances.luckiness`

### 2. Manifestation Query (Execution)
- เรียกใช้ `Gemini 2.5 Flash Image` เพื่อสร้างภาพจิตวิญญาณ
- ตรวจสอบภาพด้วยความละเอียด 1024x1024
- ประทับตรา Watermark "MEECHAIN SPIRIT"

### 3. Anchoring (On-Chain)
- ส่งข้อมูลไปยัง Smart Contract (Simulation ใน V4.1)
- บันทึกลงใน `Live Ledger` (Event Log)
- อัปเดต `Mechanical Sanctum` (Gallery)

---

## 🎲 Probability Matrix

- **Common:** 78% (Base Resonance)
- **Epic:** 18% (Mid-Resonance)
- **Legendary:** 4% (Peak Resonance or Pity Trigger)

*หมายเหตุ: เมื่อค่า Resonance ถึง 100MHz (100 units) อัตรา Legendary จะถูกล็อคไว้ที่ 100% สำหรับการ Summon ครั้งถัดไป*

---
&copy; 2025 MeeChain Protocol Management Team
