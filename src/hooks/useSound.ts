'use client';

import { useCallback, useRef, useEffect } from 'react';

type SoundType = 'click' | 'positive' | 'negative' | 'event' | 'gameover' | 'levelup';

const FREQUENCIES: Record<SoundType, number[]> = {
  click: [440, 550],
  positive: [523, 659, 784],
  negative: [392, 330, 262],
  event: [440, 523, 659, 784],
  gameover: [523, 440, 349, 262],
  levelup: [523, 659, 784, 1047],
};

const DURATIONS: Record<SoundType, number> = {
  click: 0.05,
  positive: 0.1,
  negative: 0.12,
  event: 0.15,
  gameover: 0.2,
  levelup: 0.12,
};

// ===== CHIPTUNE MUSIC ENGINE =====
// Procedurally generated 8-bit background loop using Web Audio API

// Pentatonic scale notes for a pleasant retro feel (C minor pentatonic)
const SCALE = [262, 311, 349, 392, 466, 523, 622, 698]; // C4 Eb4 F4 G4 Bb4 C5 Eb5 F5

// Melody patterns (indices into SCALE) — multiple patterns for variety
const MELODY_PATTERNS = [
  [0, 2, 4, 5, 4, 2, 3, 1],   // ascending/descending
  [5, 4, 3, 2, 4, 3, 1, 0],   // descending
  [0, 0, 2, 3, 4, 4, 3, 2],   // gentle rise
  [4, 5, 4, 3, 2, 3, 4, 2],   // wandering
  [0, 3, 2, 4, 1, 3, 5, 4],   // bouncy
];

// Bass patterns (indices into lower octave)
const BASS_PATTERNS = [
  [0, 0, 3, 3, 2, 2, 4, 4],
  [0, 2, 3, 2, 0, 4, 3, 1],
  [0, 0, 0, 3, 3, 3, 2, 4],
];

const BPM = 110;
const NOTE_DURATION = 60 / BPM; // seconds per beat
const PATTERN_LENGTH = 8;
const MUSIC_VOLUME = 0.04; // quiet background

class ChiptuneEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private nextNoteTime = 0;
  private currentBeat = 0;
  private currentMelodyPattern = 0;
  private currentBassPattern = 0;
  private patternCount = 0;
  private schedulerInterval: ReturnType<typeof setInterval> | null = null;
  private masterGain: GainNode | null = null;

  start() {
    if (this.isPlaying) return;

    try {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = MUSIC_VOLUME;
      this.masterGain.connect(this.ctx.destination);

      this.isPlaying = true;
      this.nextNoteTime = this.ctx.currentTime + 0.1;
      this.currentBeat = 0;
      this.patternCount = 0;
      this.currentMelodyPattern = 0;
      this.currentBassPattern = 0;

      // Scheduler runs ahead of time to prevent gaps
      this.schedulerInterval = setInterval(() => this.scheduler(), 50);
    } catch {
      // Audio not supported
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
    if (this.masterGain) {
      this.masterGain.gain.exponentialRampToValueAtTime(
        0.0001,
        (this.ctx?.currentTime || 0) + 0.3
      );
    }
    // Let it fade, then close
    setTimeout(() => {
      this.ctx?.close();
      this.ctx = null;
      this.masterGain = null;
    }, 500);
  }

  private scheduler() {
    if (!this.ctx || !this.isPlaying) return;

    // Schedule notes up to 200ms ahead
    while (this.nextNoteTime < this.ctx.currentTime + 0.2) {
      this.scheduleNote(this.currentBeat, this.nextNoteTime);
      this.currentBeat++;

      if (this.currentBeat >= PATTERN_LENGTH) {
        this.currentBeat = 0;
        this.patternCount++;

        // Switch patterns every 2 loops
        if (this.patternCount % 2 === 0) {
          this.currentMelodyPattern = (this.currentMelodyPattern + 1) % MELODY_PATTERNS.length;
        }
        if (this.patternCount % 3 === 0) {
          this.currentBassPattern = (this.currentBassPattern + 1) % BASS_PATTERNS.length;
        }
      }

      this.nextNoteTime += NOTE_DURATION;
    }
  }

  private scheduleNote(beat: number, time: number) {
    if (!this.ctx || !this.masterGain) return;

    const melodyPattern = MELODY_PATTERNS[this.currentMelodyPattern];
    const bassPattern = BASS_PATTERNS[this.currentBassPattern];

    // Melody voice (square wave, higher pitch)
    const melodyNote = SCALE[melodyPattern[beat]];
    this.playTone(melodyNote, time, NOTE_DURATION * 0.7, 'square', 0.6);

    // Bass voice (triangle wave, octave lower, every other beat)
    if (beat % 2 === 0) {
      const bassNote = SCALE[bassPattern[Math.floor(beat / 2) % bassPattern.length]] / 2;
      this.playTone(bassNote, time, NOTE_DURATION * 1.8, 'triangle', 0.8);
    }

    // Drum hit on beats 0 and 4 (kick)
    if (beat === 0 || beat === 4) {
      this.playDrum(time, 'kick');
    }

    // Hi-hat on every beat
    this.playDrum(time, 'hat');

    // Snare on beats 2 and 6
    if (beat === 2 || beat === 6) {
      this.playDrum(time, 'snare');
    }
  }

  private playTone(
    freq: number,
    time: number,
    duration: number,
    type: OscillatorType,
    volume: number
  ) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration + 0.01);
  }

  private playDrum(time: number, type: 'kick' | 'snare' | 'hat') {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'kick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
      gain.gain.setValueAtTime(0.7, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.15);
    } else if (type === 'snare') {
      // Noise burst for snare
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, time);
      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.08);
    } else {
      // Hi-hat — high frequency short burst
      osc.type = 'square';
      osc.frequency.setValueAtTime(8000, time);
      gain.gain.setValueAtTime(0.03, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.04);
    }
  }
}

// ===== HOOK =====

export function useSound(enabled: boolean) {
  const contextRef = useRef<AudioContext | null>(null);
  const musicRef = useRef<ChiptuneEngine | null>(null);
  const hasInteractedRef = useRef(false);

  const getContext = useCallback(() => {
    if (!contextRef.current) {
      contextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return contextRef.current;
  }, []);

  // Lazy-start music — only when we have both a user gesture AND sound is enabled
  const startMusicIfReady = useCallback(() => {
    if (!enabled || !hasInteractedRef.current) return;
    if (musicRef.current) return; // already running

    musicRef.current = new ChiptuneEngine();
    musicRef.current.start();
  }, [enabled]);

  // Stop music when disabled
  useEffect(() => {
    if (!enabled) {
      musicRef.current?.stop();
      musicRef.current = null;
    } else if (hasInteractedRef.current && !musicRef.current) {
      // Re-enable after user already interacted
      musicRef.current = new ChiptuneEngine();
      musicRef.current.start();
    }

    return () => {
      if (!enabled) {
        musicRef.current?.stop();
        musicRef.current = null;
      }
    };
  }, [enabled]);

  const play = useCallback(
    (type: SoundType) => {
      // Mark user interaction on first play — this unlocks audio contexts
      if (!hasInteractedRef.current) {
        hasInteractedRef.current = true;
        // Resume audio context if suspended (mobile browsers)
        const ctx = getContext();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        // Start music now that we have a user gesture
        startMusicIfReady();
      }

      if (!enabled) return;

      try {
        const ctx = getContext();
        const frequencies = FREQUENCIES[type];
        const duration = DURATIONS[type];

        frequencies.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'square';
          osc.frequency.value = freq;
          gain.gain.value = 0.08;
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + (i + 1) * duration
          );

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + i * duration);
          osc.stop(ctx.currentTime + (i + 1) * duration + 0.05);
        });
      } catch {
        // Audio not supported
      }
    },
    [enabled, getContext, startMusicIfReady]
  );

  return { play };
}
