
# 🌀 MeeBot Summoning Protocol (MSP-01) - Contributor Guide

คู่มือฉบับนี้กำหนดมาตรฐานการทำงานของพิธีกรรม "Summoning" เพื่อให้มั่นใจในความแม่นยำและความศักดิ์สิทธิ์ของทุกการ Manifestation

---

## 🧬 พิธีกรรมแบบ 6 ขั้นตอน (The Hexa-Step Ritual)

### 1. Resonance Selection (Prompt & Mode)
- **Input:** ผู้ใช้กำหนด `prompt` เพื่อสื่อสารกับ AI หรืออัปโหลด `blueprint` (local file)
- **Mechanic:** ใช้ `generateMeeBot()` (Gemini API) หรือ `readAsDataURL()` เพื่อสร้างภาพตัวอย่าง (Preview)

### 2. Neural Preview (Image Handling)
- **Visual:** แสดงผลภาพวิญญาณใน "Mechanical Sanctum Preview"
- **Stability:** ตรวจสอบความสมบูรณ์ของข้อมูลภาพก่อนเริ่มพิธีกรรมจริง

### 3. Anchoring Invocation (Begin Ritual)
- **Trigger:** ผู้ใช้ยืนยันการ Summon ผ่านปุ่ม "Begin Summoning Ritual"
- **Blockchain:** เรียกฟังก์ชัน `mintMeeBot(prompt, imageBase64)` บน Smart Contract
- **Cost:** หัก Gems จาก Vessel เพื่อเป็นเชื้อเพลิงในพิธีกรรม

### 4. Smart Contract Manifestation
- **Solidity Logic:**
  ```solidity
  function mintMeeBot(string memory prompt, string memory imageBase64) public {
    uint256 tokenId = _nextId++;
    _safeMint(msg.sender, tokenId);
    emit MeeBotMinted(msg.sender, prompt, imageBase64);
  }
  ```

### 5. Event Synchronization (Listening)
- **Feedback:** Frontend ตรวจพบ Event `MeeBotMinted`
- **UI:** แสดงผลความสำเร็จพร้อม Transaction Hash สำหรับการตรวจสอบบน Explorer

### 6. Resonance Calibration (Pity & Tier)
- **Luckiness:** ทุกการ Summon จะเพิ่มค่า `luckiness` (Resonance)
- **Tier Shift:** เมื่อค่า Resonance ถึง 100MHz จะได้รับรางวัลระดับ **Legendary** โดยการันตี
- **Resonance Reset:** หลังได้รับ Legendary ระบบจะ Reset ค่า Resonance เพื่อเริ่มรอบใหม่

---

## 🛠️ รายการตรวจสอบสำหรับนักพัฒนา (Dev Checklist)

- [x] รองรับ Prompt & Mode selection (Manifest vs Uplink)
- [x] ระบบ Preview ภาพวิญญาณทำงานได้รวดเร็ว
- [x] การเรียก Smart Contract ผ่าน `writeContract` มีความเสถียร
- [x] ระบบดักจับ Event `MeeBotMinted` แสดงผลข้อมูลถูกต้อง
- [x] ตรรกะ Resonance Pity คำนวณความถี่ได้แม่นยำ

---
&copy; 2025 MeeChain Protocol Management Team
