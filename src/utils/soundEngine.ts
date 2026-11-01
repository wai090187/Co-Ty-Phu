/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundEngine {
  private enabled: boolean = true;
  private audioCtx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, gainValue = 0.1, delay = 0) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

      gain.gain.setValueAtTime(gainValue, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    } catch {
      // Audio autoplay policy catch
    }
  }

  public rollDice() {
    for (let i = 0; i < 4; i++) {
      this.playTone(200 + Math.random() * 200, 'square', 0.05, 0.05, i * 0.06);
    }
  }

  public step() {
    this.playTone(440, 'triangle', 0.05, 0.08);
  }

  public cash() {
    this.playTone(587.33, 'sine', 0.1, 0.08, 0); // D5
    this.playTone(880, 'sine', 0.2, 0.1, 0.08); // A5
  }

  public purchase() {
    this.playTone(523.25, 'triangle', 0.12, 0.1, 0); // C5
    this.playTone(659.25, 'triangle', 0.15, 0.1, 0.08); // E5
    this.playTone(783.99, 'triangle', 0.25, 0.12, 0.16); // G5
  }

  public buildHouse() {
    this.playTone(329.63, 'sawtooth', 0.08, 0.06, 0); // E4
    this.playTone(440, 'sawtooth', 0.08, 0.06, 0.07); // A4
    this.playTone(554.37, 'triangle', 0.15, 0.08, 0.14); // C#5
  }

  public jail() {
    this.playTone(220, 'sawtooth', 0.2, 0.1, 0);
    this.playTone(185, 'sawtooth', 0.25, 0.12, 0.15);
    this.playTone(146.83, 'sawtooth', 0.4, 0.15, 0.3);
  }

  public cardDraw() {
    this.playTone(600, 'sine', 0.08, 0.06, 0);
    this.playTone(750, 'sine', 0.1, 0.07, 0.05);
  }

  public ability() {
    this.playTone(440, 'sine', 0.1, 0.08, 0);
    this.playTone(660, 'sine', 0.1, 0.09, 0.06);
    this.playTone(880, 'sine', 0.2, 0.1, 0.12);
  }

  public victory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.25, 0.12, idx * 0.12);
    });
  }
}

export const sounds = new SoundEngine();
