/**
 * AudioManager - Generates and plays procedural sounds
 * 
 * Uses the Web Audio API to synthesize all game sounds procedurally.
 * No external audio files required. Gracefully degrades if Web Audio
 * API is not available.
 */

export class AudioManager {
    constructor() {
        this.audioCtx = null;
        this.gainNode = null;
        this.volume = 0.8;
        this.isInitialized = false;
    }
    
    /**
     * Initialize Audio Context (must be called after user interaction)
     */
    init() {
        if (this.isInitialized) {
            return;
        }
        
        try {
            // Create AudioContext
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                console.warn('Web Audio API not supported');
                return;
            }
            
            this.audioCtx = new AudioContext();
            
            // Create master gain node
            this.gainNode = this.audioCtx.createGain();
            this.gainNode.gain.value = this.volume;
            this.gainNode.connect(this.audioCtx.destination);
            
            // Resume context if suspended (autoplay policy)
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
            
            this.isInitialized = true;
            console.log('AudioManager initialized');
        } catch (e) {
            console.error('Failed to initialize AudioManager:', e);
        }
    }
    
    /**
     * Play a tone with frequency sweep
     * @param {number} startFreq - Starting frequency in Hz
     * @param {number} endFreq - Ending frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {string} type - Oscillator type ('sine', 'square', 'sawtooth', 'triangle')
     * @private
     */
    _playTone(startFreq, endFreq, duration, type = 'sine') {
        if (!this.isInitialized || !this.audioCtx) {
            return;
        }
        
        try {
            const now = this.audioCtx.currentTime;
            
            // Create oscillator
            const oscillator = this.audioCtx.createOscillator();
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(startFreq, now);
            oscillator.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
            
            // Create gain for envelope
            const envelope = this.audioCtx.createGain();
            envelope.gain.setValueAtTime(0.3, now);
            envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);
            
            // Connect nodes
            oscillator.connect(envelope);
            envelope.connect(this.gainNode);
            
            // Start and stop
            oscillator.start(now);
            oscillator.stop(now + duration);
        } catch (e) {
            console.error('Error playing tone:', e);
        }
    }
    
    /**
     * Play jump sound
     */
    playJump() {
        this._playTone(400, 600, 0.1, 'sine');
    }
    
    /**
     * Play point scored sound
     */
    playPoint() {
        this._playTone(880, 880, 0.15, 'square');
    }
    
    /**
     * Play collision sound
     */
    playCollision() {
        this._playTone(300, 100, 0.3, 'sawtooth');
    }
    
    /**
     * Play game over sound
     */
    playGameOver() {
        this._playTone(200, 50, 0.5, 'sawtooth');
    }
    
    /**
     * Set volume level
     * @param {number} level - Volume level (0.0 to 1.0)
     */
    setVolume(level) {
        // Clamp to [0, 1]
        this.volume = Math.max(0, Math.min(1, level));
        
        if (this.gainNode) {
            this.gainNode.gain.value = this.volume;
        }
    }
    
    /**
     * Get current volume level
     * @returns {number}
     */
    getVolume() {
        return this.volume;
    }
    
    /**
     * Clean up audio context
     */
    destroy() {
        if (this.audioCtx) {
            this.audioCtx.close();
            this.audioCtx = null;
            this.gainNode = null;
            this.isInitialized = false;
        }
    }
}
