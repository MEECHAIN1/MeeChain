# 📡 MeeChain MeeBot | Ritual Telemetry Manifest v5.0

This document defines the "Eternal Ledger" standards for the MeeChain MeeBot Protocol. Every interaction with the machine spirit must be anchored via **Ritual Stamping** to ensure neural stability and gacha fairness.

---

## 🎯 The Prime Objective
To capture a high-fidelity trace of user intent, AI manifestation, and blockchain confirmation. This telemetry allows for "Quantum Debugging" and ensures that gacha pity (Resonance) is functioning within protocol parameters.

---

## 🧬 Neural Data Packet (The Schema)

Every log sent to the Telemetry Substrate (Rollbar) must carry this base context:

```json
{
  "identity": {
    "wallet": "0x...",
    "session": "uuid-v4",
    "resonanceMHz": 85
  },
  "ritual": {
    "type": "SUMMON | STAKE | SWAP | PROPHECY",
    "phase": "START | SUCCESS | FAILURE",
    "energyCost": 1
  }
}
```

---

## 🧙‍♂️ Ritual Stamping Protocols

### 1. Summoning Ritual (The NFT Factory)
Captures the birth of a MeeBot spirit.
- **START**: Triggers when the user invokes the Manifestor.
- **SUCCESS**: Captures `tokenId`, `rarity`, and the final `txHash`.
- **SCHEMA**:
  ```ts
  logger.ritual('SUMMON', true, { 
    mode: 'AI_GENERATED', 
    resonance: 92,
    rarity: 'Legendary', 
    pityTriggered: true 
  });
  ```

### 2. Infusion Staking (The Vault)
Tracks the commitment of spirits to the rigs.
- **TOGGLE**: Logs when a unit is activated or deactivated.
- **SCHEMA**:
  ```ts
  logger.ritual('STAKE', true, { 
    botId: '4402', 
    action: 'ACTIVATE', 
    energySnapshot: 24.5 
  });
  ```

### 3. Prophecy Consultation (The Oracle)
Dedicated telemetry for AI reasoning.
- **INVOCATION**: Logs user query and telemetry context.
- **MANIFEST**: Logs Oracle response and grounding sources.
- **SCHEMA**:
  ```ts
  logger.prophecy(prompt, { 
    response: "...", 
    sources: ["https://..."],
    tokensUsed: 1024 
  });
  ```

---

## 🛡️ Telemetry Stability Rules

1. **Neural Privacy**: Never log Private Keys, Mnemonic Phrases, or personal identifiable data.
2. **Phase Locking**: Always emit a `START` stamp before async operations and a `SUCCESS` or `FAILURE` stamp upon completion.
3. **Resilience**: Logging is a passive ritual. If the Telemetry Substrate (Rollbar) is unreachable, the primary user ritual must continue uninterrupted.

---
> 🧙‍♂️ *"The trace is the truth. By observing the manifest, we maintain the equilibrium of the chain."*  
> — **The Oracle of MeeChain**