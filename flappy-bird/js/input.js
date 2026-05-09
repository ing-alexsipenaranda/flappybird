/**
 * InputHandler - Captures and normalizes input events
 * 
 * Handles keyboard, mouse, and touch input. Provides callbacks
 * for jump and pause actions. Includes debouncing to prevent
 * accidental multiple jumps.
 */

export class InputHandler {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.config = config;
        
        // Callbacks
        this.jumpCallback = null;
        this.pauseCallback = null;
        
        // Debouncing
        this.lastJumpTime = 0;
        
        // Touch tracking for swipe detection
        this.touchStartY = 0;
        
        // Bound event handlers (for removal)
        this._keydownHandler = this._onKeyDown.bind(this);
        this._mousedownHandler = this._onMouseDown.bind(this);
        this._touchstartHandler = this._onTouchStart.bind(this);
        this._touchendHandler = this._onTouchEnd.bind(this);
        
        // Register event listeners
        this._registerListeners();
    }
    
    /**
     * Register jump callback
     * @param {Function} callback
     */
    onJump(callback) {
        this.jumpCallback = callback;
    }
    
    /**
     * Register pause callback
     * @param {Function} callback
     */
    onPause(callback) {
        this.pauseCallback = callback;
    }
    
    /**
     * Register all event listeners
     * @private
     */
    _registerListeners() {
        // Keyboard events
        document.addEventListener('keydown', this._keydownHandler);
        
        // Mouse events
        this.canvas.addEventListener('mousedown', this._mousedownHandler);
        
        // Touch events
        this.canvas.addEventListener('touchstart', this._touchstartHandler, { passive: false });
        this.canvas.addEventListener('touchend', this._touchendHandler, { passive: false });
    }
    
    /**
     * Handle keydown events
     * @param {KeyboardEvent} event
     * @private
     */
    _onKeyDown(event) {
        // Jump on Space or ArrowUp
        if (event.code === 'Space' || event.code === 'ArrowUp') {
            event.preventDefault();
            this._fireJump();
        }
        
        // Pause on Escape
        if (event.code === 'Escape') {
            event.preventDefault();
            this._firePause();
        }
    }
    
    /**
     * Handle mousedown events
     * @param {MouseEvent} event
     * @private
     */
    _onMouseDown(event) {
        // Only respond to primary button (left click)
        if (event.button === 0) {
            this._fireJump();
        }
    }
    
    /**
     * Handle touchstart events
     * @param {TouchEvent} event
     * @private
     */
    _onTouchStart(event) {
        event.preventDefault();
        
        if (event.touches.length > 0) {
            // Record touch start Y for swipe detection
            this.touchStartY = event.touches[0].clientY;
            
            // Fire jump immediately on touch
            this._fireJump();
        }
    }
    
    /**
     * Handle touchend events
     * @param {TouchEvent} event
     * @private
     */
    _onTouchEnd(event) {
        event.preventDefault();
        
        if (event.changedTouches.length > 0) {
            const touchEndY = event.changedTouches[0].clientY;
            const deltaY = this.touchStartY - touchEndY;
            
            // Detect swipe up gesture (moved up more than 50px)
            if (deltaY > 50) {
                this._fireJump();
            }
        }
    }
    
    /**
     * Fire jump callback with debouncing
     * @private
     */
    _fireJump() {
        const now = Date.now();
        
        // Check debounce
        if (now - this.lastJumpTime < this.config.INPUT_DEBOUNCE_MS) {
            return;
        }
        
        this.lastJumpTime = now;
        
        if (this.jumpCallback) {
            this.jumpCallback();
        }
    }
    
    /**
     * Fire pause callback
     * @private
     */
    _firePause() {
        if (this.pauseCallback) {
            this.pauseCallback();
        }
    }
    
    /**
     * Remove all event listeners
     */
    destroy() {
        document.removeEventListener('keydown', this._keydownHandler);
        this.canvas.removeEventListener('mousedown', this._mousedownHandler);
        this.canvas.removeEventListener('touchstart', this._touchstartHandler);
        this.canvas.removeEventListener('touchend', this._touchendHandler);
    }
}
