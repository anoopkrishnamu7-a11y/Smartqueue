// Web Audio API Chime & Speech Synthesis Announcer
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a hospital/airport style melodic chime
 */
export function playChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // First tone (G4 = 392Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(392, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Second tone (C5 = 523.25Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(523.25, now + 0.25);
    gain2.gain.setValueAtTime(0, now + 0.25);
    gain2.gain.linearRampToValueAtTime(0.28, now + 0.3);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.25);
    osc2.stop(now + 0.85);
  } catch (err) {
    console.warn("Audio chime playback blocked or unavailable:", err);
  }
}

/**
 * Speak token announcement using Web Speech API
 * e.g. "Token C 104, please proceed to Counter 1"
 */
export function speakAnnouncement(tokenNumber, counterName) {
  if (!('speechSynthesis' in window)) return;

  try {
    // Format token e.g. "C 104" or "Token C, 1 0 4"
    const prefix = tokenNumber.replace(/[0-9]/g, '');
    const number = tokenNumber.replace(/[^0-9]/g, '');
    const spacedNumber = number.split('').join(' ');
    const text = `Token ${prefix} ${spacedNumber}. Please proceed to ${counterName || 'assigned counter'}.`;

    window.speechSynthesis.cancel(); // Stop any pending speech

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;

      // Pick a clean English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.lang.startsWith('en')));
      if (preferred) utterance.voice = preferred;

      window.speechSynthesis.speak(utterance);
    }, 400);
  } catch (err) {
    console.warn("Speech synthesis unavailable:", err);
  }
}

export function announceTokenCall(tokenNumber, counterName, soundEnabled = true) {
  if (!soundEnabled) return;
  playChime();
  speakAnnouncement(tokenNumber, counterName);
}
