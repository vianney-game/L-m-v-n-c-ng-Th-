/**
 * Audio synthesis helper using Web Audio API and Speech Synthesis API
 * 100% self-contained, no external mp3 assets needed.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a light wooden pick-up sound
 */
export function playWoodPick(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(320, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.09);
}

/**
 * Play a crisp wooden snap/drop sound
 */
export function playWoodSnap(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(450, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.12);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.13);
}

/**
 * Play cheerful success chime for 1 correct basket
 */
export function playSuccessChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const startTime = ctx.currentTime + idx * 0.07;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.48);
  });
}

/**
 * Play full celebratory fanfare when both baskets are matched
 */
export function playVictoryFanfare(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const sequence = [
    { freq: 523.25, time: 0.0 }, // C5
    { freq: 659.25, time: 0.1 }, // E5
    { freq: 783.99, time: 0.2 }, // G5
    { freq: 1046.5, time: 0.3 }, // C6
    { freq: 880.00, time: 0.45 }, // A5
    { freq: 1046.5, time: 0.55 }, // C6
    { freq: 1318.5, time: 0.70 }, // E6
  ];

  sequence.forEach(({ freq, time }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const startTime = ctx.currentTime + time;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.28, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.65);
  });
}

/**
 * Play a gentle, encouraging boing tone when misplaced (never harsh)
 */
export function playGentleWrong(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
  osc.frequency.exponentialRampToValueAtTime(261.63, ctx.currentTime + 0.25); // C4

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}

// Voices cache and voiceschanged event handling
let cachedVoices: SpeechSynthesisVoice[] = [];
let isVoiceInitialized = false;

function initVoices(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const list = window.speechSynthesis.getVoices();
  if (list && list.length > 0) {
    cachedVoices = list;
    isVoiceInitialized = true;
  }
}

// Register voiceschanged listeners if in browser
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  initVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      initVoices();
    };
  }
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    initVoices();
  });
}

/**
 * Find best matching Vietnamese voice with vi-VN priority
 */
export function findVietnameseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }
  initVoices();

  // 1. Exact match for 'vi-VN' or 'vi_VN'
  const viVn = cachedVoices.find((v) => {
    const lang = v.lang.replace('_', '-').toLowerCase();
    return lang === 'vi-vn';
  });
  if (viVn) return viVn;

  // 2. Starts with 'vi'
  const viGeneral = cachedVoices.find((v) => {
    const lang = v.lang.replace('_', '-').toLowerCase();
    return lang.startsWith('vi');
  });
  if (viGeneral) return viGeneral;

  // 3. Fallback: match voice name
  const nameMatch = cachedVoices.find((v) =>
    /vietnam|vietnamese|tiếng việt/i.test(v.name)
  );
  if (nameMatch) return nameMatch;

  return null;
}

/**
 * Check if the browser currently has a native Vietnamese voice
 */
export function hasVietnameseVoiceSupport(): boolean {
  return Boolean(findVietnameseVoice());
}

export interface SpeakResult {
  spoken: boolean;
  hasVietnameseVoice: boolean;
  error?: string;
}

/**
 * Speak Vietnamese text using Web Speech API with vi-VN prioritization
 * Handles cancellation of previous speech to prevent overlapping
 */
export function speakVietnamese(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): SpeakResult {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return { spoken: false, hasVietnameseVoice: false, error: 'NO_SPEECH_API' };
  }

  try {
    // 1. Dừng bất kỳ lời thoại nào đang phát trước đó để không bị chồng tiếng
    window.speechSynthesis.cancel();

    const viVoice = findVietnameseVoice();
    const hasViVoice = Boolean(viVoice);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.88; // Tốc độ vừa phải, tự nhiên, phù hợp với trẻ mầm non
    utterance.pitch = 1.15; // Âm sắc Thỏ vui vẻ, thân thiện

    if (viVoice) {
      utterance.voice = viVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };
    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = (e) => {
      // Khi cancel() được gọi, trình duyệt sinh lỗi 'canceled' - đây là hành vi bình thường
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return { spoken: true, hasVietnameseVoice: hasViVoice };
  } catch (err) {
    console.warn('Speech synthesis error:', err);
    if (onEnd) onEnd();
    return { spoken: false, hasVietnameseVoice: false, error: String(err) };
  }
}
