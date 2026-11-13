export type SoundType = 'correct' | 'wrong' | 'click' | 'pop' | 'win' | 'tick';

class SoundController {
  private ctx: AudioContext | null = null;
  private muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  public play(type: SoundType): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const playTone = (
      freq: number,
      duration: number,
      delay = 0,
      wave: OscillatorType = 'sine',
      gainVal = 0.14
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, now + delay);
      gain.gain.setValueAtTime(gainVal, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + duration + 0.02);
    };

    switch (type) {
      case 'click':
        playTone(520, 0.06, 0, 'triangle', 0.08);
        break;
      case 'pop':
        playTone(440, 0.06, 0, 'sine', 0.11);
        playTone(760, 0.08, 0.04, 'sine', 0.1);
        break;
      case 'correct':
        playTone(523.25, 0.11, 0, 'triangle', 0.14);
        playTone(659.25, 0.12, 0.08, 'triangle', 0.14);
        playTone(783.99, 0.18, 0.16, 'triangle', 0.15);
        break;
      case 'wrong':
        playTone(220, 0.14, 0, 'sawtooth', 0.09);
        playTone(175, 0.2, 0.11, 'sawtooth', 0.09);
        break;
      case 'tick':
        playTone(880, 0.04, 0, 'square', 0.04);
        break;
      case 'win':
        playTone(523.25, 0.12, 0, 'triangle', 0.15);
        playTone(659.25, 0.12, 0.1, 'triangle', 0.15);
        playTone(783.99, 0.12, 0.2, 'triangle', 0.15);
        playTone(1046.5, 0.35, 0.32, 'triangle', 0.17);
        break;
    }
  }
}

export const soundFx = new SoundController();
