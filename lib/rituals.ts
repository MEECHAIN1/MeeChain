
/**
 * Rituals Module
 * Handles success celebrations and visual/audio feedback rituals.
 */

declare const confetti: any;

// Ethereal Sound URLs (Publicly accessible assets for the ritual)
const SOUNDS = {
  success: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Crystal Chime
  celestial: 'https://assets.mixkit.co/active_storage/sfx/2016/2016-preview.mp3', // Soft Synth Pad
  warp: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' // Energy Pulse
};

const playSound = (url: string) => {
  try {
    const audio = new Audio(url);
    audio.volume = 0.3;
    audio.play();
  } catch (e) {
    console.warn("Ritual Audio muted by system restrictions.");
  }
};

export const triggerSuccessRitual = () => {
  playSound(SOUNDS.success);
  if (typeof confetti !== 'undefined') {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#6366f1', '#10b981']
    });
  }
};

export const triggerCelestialRitual = () => {
  playSound(SOUNDS.celestial);
};

export const triggerWarpRitual = () => {
  playSound(SOUNDS.warp);
};

export const triggerMintRitual = () => {
  playSound(SOUNDS.success);
  if (typeof confetti !== 'undefined') {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }
};
