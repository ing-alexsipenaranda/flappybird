/**
 * StorageManager - Handles data persistence using localStorage
 * 
 * Wraps localStorage with JSON serialization and provides fallback
 * to in-memory storage if localStorage is unavailable.
 */

export class StorageManager {
    constructor() {
        // Storage keys
        this.KEYS = {
            HIGH_SCORE: 'flappybird_highscore',
            DIFFICULTY: 'flappybird_difficulty',
            DARK_MODE: 'flappybird_darkmode',
            VOLUME: 'flappybird_volume',
        };
        
        // Default values
        this.DEFAULTS = {
            HIGH_SCORE: 0,
            DIFFICULTY: 'NORMAL',
            DARK_MODE: false,
            VOLUME: 0.8,
        };
        
        // Check if localStorage is available
        this.isLocalStorageAvailable = this._checkLocalStorage();
        
        // Fallback in-memory storage
        this.memoryStorage = new Map();
        
        console.log(`StorageManager initialized (localStorage: ${this.isLocalStorageAvailable})`);
    }
    
    /**
     * Check if localStorage is available
     * @returns {boolean}
     * @private
     */
    _checkLocalStorage() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage not available, using in-memory storage');
            return false;
        }
    }
    
    /**
     * Get a value from storage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*}
     * @private
     */
    _get(key, defaultValue) {
        try {
            if (this.isLocalStorageAvailable) {
                const value = localStorage.getItem(key);
                if (value === null) {
                    return defaultValue;
                }
                return JSON.parse(value);
            } else {
                return this.memoryStorage.has(key) 
                    ? this.memoryStorage.get(key) 
                    : defaultValue;
            }
        } catch (e) {
            console.error(`Error reading ${key}:`, e);
            return defaultValue;
        }
    }
    
    /**
     * Set a value in storage
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @private
     */
    _set(key, value) {
        try {
            if (this.isLocalStorageAvailable) {
                localStorage.setItem(key, JSON.stringify(value));
            } else {
                this.memoryStorage.set(key, value);
            }
        } catch (e) {
            console.error(`Error writing ${key}:`, e);
        }
    }
    
    /**
     * Remove a value from storage
     * @param {string} key - Storage key
     * @private
     */
    _remove(key) {
        try {
            if (this.isLocalStorageAvailable) {
                localStorage.removeItem(key);
            } else {
                this.memoryStorage.delete(key);
            }
        } catch (e) {
            console.error(`Error removing ${key}:`, e);
        }
    }
    
    // ========================================================================
    // PUBLIC API
    // ========================================================================
    
    /**
     * Get high score
     * @returns {number}
     */
    getHighScore() {
        const value = this._get(this.KEYS.HIGH_SCORE, this.DEFAULTS.HIGH_SCORE);
        // Validate that it's a number
        return typeof value === 'number' && !isNaN(value) && value >= 0 
            ? value 
            : this.DEFAULTS.HIGH_SCORE;
    }
    
    /**
     * Set high score
     * @param {number} score
     */
    setHighScore(score) {
        if (typeof score === 'number' && !isNaN(score) && score >= 0) {
            this._set(this.KEYS.HIGH_SCORE, score);
        }
    }
    
    /**
     * Get difficulty setting
     * @returns {'EASY'|'NORMAL'|'HARD'}
     */
    getDifficulty() {
        const value = this._get(this.KEYS.DIFFICULTY, this.DEFAULTS.DIFFICULTY);
        // Validate that it's a valid difficulty
        return ['EASY', 'NORMAL', 'HARD'].includes(value) 
            ? value 
            : this.DEFAULTS.DIFFICULTY;
    }
    
    /**
     * Set difficulty setting
     * @param {'EASY'|'NORMAL'|'HARD'} difficulty
     */
    setDifficulty(difficulty) {
        if (['EASY', 'NORMAL', 'HARD'].includes(difficulty)) {
            this._set(this.KEYS.DIFFICULTY, difficulty);
        }
    }
    
    /**
     * Get dark mode setting
     * @returns {boolean}
     */
    getDarkMode() {
        const value = this._get(this.KEYS.DARK_MODE, this.DEFAULTS.DARK_MODE);
        // Validate that it's a boolean
        return typeof value === 'boolean' 
            ? value 
            : this.DEFAULTS.DARK_MODE;
    }
    
    /**
     * Set dark mode setting
     * @param {boolean} enabled
     */
    setDarkMode(enabled) {
        if (typeof enabled === 'boolean') {
            this._set(this.KEYS.DARK_MODE, enabled);
        }
    }
    
    /**
     * Get volume setting
     * @returns {number} - Value between 0.0 and 1.0
     */
    getVolume() {
        const value = this._get(this.KEYS.VOLUME, this.DEFAULTS.VOLUME);
        // Validate that it's a number in range [0, 1]
        return typeof value === 'number' && !isNaN(value) && value >= 0 && value <= 1
            ? value 
            : this.DEFAULTS.VOLUME;
    }
    
    /**
     * Set volume setting
     * @param {number} level - Value between 0.0 and 1.0
     */
    setVolume(level) {
        if (typeof level === 'number' && !isNaN(level)) {
            // Clamp to [0, 1]
            const clamped = Math.max(0, Math.min(1, level));
            this._set(this.KEYS.VOLUME, clamped);
        }
    }
    
    /**
     * Reset high score
     */
    resetHighScore() {
        this._remove(this.KEYS.HIGH_SCORE);
    }
    
    /**
     * Clear all stored data
     */
    clearAll() {
        Object.values(this.KEYS).forEach(key => this._remove(key));
    }
}
