
/**
 * Audio Celebration Module
 * Specialized audio feedback for the MeeBot Ecosystem.
 */

const CELEBRATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';

export default function celebration() {
  try {
    const audio = new Audio(CELEBRATION_SOUND);
    audio.volume = 0.5;
    audio.play().catch((err) => {
      console.warn('🔇 Celebration sound blocked by browser policy:', err);
    });
  } catch (e) {
    console.warn('🔇 Audio context failure:', e);
  }
}
