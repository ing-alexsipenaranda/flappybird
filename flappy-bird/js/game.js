/**
 * Flappy Bird Game - Main Game Module
 * 
 * This module contains the main Game class that orchestrates the entire game,
 * the CONFIG object with all configurable constants, and the GameState enum.
 */

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

export const CONFIG = {
    // Physics constants
    GRAVITY: 1500,                  // px/s² - gravitational acceleration
    JUMP_VELOCITY: -450,            // px/s - upward velocity on jump
    
    // Pipe speed by difficulty
    PIPE_SPEED_EASY: 180,           // px/s
    PIPE_SPEED_NORMAL: 220,         // px/s
    PIPE_SPEED_HARD: 280,           // px/s
    
    // Pipe spawn intervals by difficulty
    PIPE_INTERVAL_EASY: 2.0,        // seconds
    PIPE_INTERVAL_NORMAL: 1.8,      // seconds
    PIPE_INTERVAL_HARD: 1.5,        // seconds
    
    // Pipe gap sizes by difficulty
    GAP_EASY: 180,                  // px
    GAP_NORMAL: 150,                // px
    GAP_HARD: 120,                  // px
    
    // Difficulty progression
    PIPE_SPEED_INCREMENT: 5,        // px/s per 10 points
    PIPE_SPEED_MAX: 400,            // px/s - maximum pipe speed
    
    // Game loop
    DELTA_TIME_CAP: 0.1,            // seconds - max deltaTime to prevent physics jumps
    
    // Player positioning and collision
    PLAYER_X_RATIO: 0.25,           // fraction of canvas width for player X position
    COLLISION_SHRINK: 0.70,         // hitbox size relative to sprite (70%)
    
    // Animation
    SPRITE_FPS: 10,                 // bird wing animation frames per second
    SPRITE_FRAMES: 3,               // number of animation frames
    
    // Input
    INPUT_DEBOUNCE_MS: 100,         // milliseconds - debounce time for jump input
    
    // Aspect ratios
    ASPECT_MOBILE: [9, 16],         // vertical aspect ratio for mobile
    ASPECT_DESKTOP: [4, 3],         // horizontal aspect ratio for desktop
};

// ============================================================================
// GAME STATE ENUM
// ============================================================================

export const GameState = Object.freeze({
    IDLE: 'IDLE',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER',
    SETTINGS: 'SETTINGS',
});

// ============================================================================
// GAME CLASS
// ============================================================================

/**
 * Main Game class - orchestrates the game loop and all subsystems
 */
export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Game state
        this.gameState = GameState.IDLE;
        this.score = 0;
        this.highScore = 0;
        this.difficulty = 'NORMAL';
        this.darkMode = false;
        this.volume = 0.8;
        
        // Game loop timing
        this.lastTime = 0;
        this.rafId = null;
        
        // Subsystems (will be initialized in init())
        this.storage = null;
        this.audio = null;
        this.input = null;
        this.physics = null;
        this.player = null;
        this.pipeManager = null;
        this.particles = null;
        this.background = null;
        this.ui = null;
        
        // Bind methods
        this.tick = this.tick.bind(this);
        this._onResize = this._onResize.bind(this);
        this._handleJump = this._handleJump.bind(this);
        this._handlePause = this._handlePause.bind(this);
        this._handleClick = this._handleClick.bind(this);
    }
    
    /**
     * Initialize all subsystems and load persisted settings
     */
    async init() {
        try {
            console.log('Game initializing...');
            
            // Import all modules
            const { StorageManager } = await import('./storage.js');
            const { AudioManager } = await import('./audio.js');
            const { InputHandler } = await import('./input.js');
            const { Physics } = await import('./physics.js');
            const { Player } = await import('./player.js');
            const { PipeManager } = await import('./pipes.js');
            const { ParticleSystem } = await import('./particles.js');
            const { Background } = await import('./background.js');
            const { UI } = await import('./ui.js');
            
            console.log('Modules imported successfully');
            
            // Initialize subsystems
            this.storage = new StorageManager();
            this.audio = new AudioManager();
            this.input = new InputHandler(this.canvas, CONFIG);
            this.physics = new Physics(this.canvas, CONFIG);
            this.player = new Player(this.canvas, CONFIG);
            this.pipeManager = new PipeManager(this.canvas, CONFIG, this.difficulty);
            this.particles = new ParticleSystem();
            this.background = new Background(this.canvas, CONFIG);
            this.ui = new UI(this.canvas, CONFIG);
            
            console.log('Subsystems initialized');
            
            // Load persisted settings
            this.highScore = this.storage.getHighScore();
            this.difficulty = this.storage.getDifficulty();
            this.darkMode = this.storage.getDarkMode();
            this.volume = this.storage.getVolume();
            
            // Apply settings
            this.audio.setVolume(this.volume);
            this.pipeManager.setDifficulty(this.difficulty);
            
            // Register input callbacks
            this.input.onJump(this._handleJump);
            this.input.onPause(this._handlePause);
            
            // Set initial canvas size
            this._onResize();
            
            // Register resize listener
            window.addEventListener('resize', this._onResize);
            
            // Register click listener for UI interactions
            this.canvas.addEventListener('click', this._handleClick);
            this.canvas.addEventListener('touchend', this._handleClick);
            
            console.log('Game initialized successfully');
            
            // Hide loading screen
            const loading = document.getElementById('loading');
            if (loading) {
                loading.classList.add('hidden');
                setTimeout(() => loading.remove(), 300);
            }
        } catch (error) {
            console.error('Failed to initialize game:', error);
            
            // Show error message
            const loading = document.getElementById('loading');
            if (loading) {
                loading.innerHTML = `
                    <div class="spinner"></div>
                    <p style="color: #ff4444;">Error al cargar el juego</p>
                    <p style="font-size: 14px;">${error.message}</p>
                `;
            }
        }
    }
    
    /**
     * Start the game loop
     */
    start() {
        this.lastTime = performance.now();
        this.rafId = requestAnimationFrame(this.tick);
    }
    
    /**
     * Main game loop tick
     * @param {number} timestamp - Current timestamp from requestAnimationFrame
     */
    tick(timestamp) {
        // Calculate delta time and cap it
        let deltaTime = (timestamp - this.lastTime) / 1000;
        deltaTime = Math.min(deltaTime, CONFIG.DELTA_TIME_CAP);
        this.lastTime = timestamp;
        
        // Update game logic
        if (this.gameState === GameState.PLAYING) {
            this.update(deltaTime);
        }
        
        // Render
        this.render();
        
        // Schedule next frame
        this.rafId = requestAnimationFrame(this.tick);
    }
    
    /**
     * Update game logic (called only when PLAYING)
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     */
    update(deltaTime) {
        // Update physics
        this.physics.update(this.player, deltaTime);
        
        // Update player animation
        this.player.update(deltaTime);
        
        // Update pipes
        this.pipeManager.update(deltaTime);
        
        // Update particles
        this.particles.update(deltaTime);
        
        // Update background
        this.background.update(this.pipeManager.speed, deltaTime);
        
        // Check collisions
        this._checkCollisions();
        
        // Check scoring
        this._checkScoring();
    }
    
    /**
     * Render the current game state
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render background
        this.background.render(this.ctx, this.darkMode);
        
        // Render game objects
        this.pipeManager.render(this.ctx);
        this.player.render(this.ctx);
        this.particles.render(this.ctx);
        
        // Render UI
        this.ui.render(
            this.gameState,
            this.score,
            this.highScore,
            this.darkMode,
            this.difficulty,
            this._isTouchDevice(),
            this.volume
        );
    }
    
    /**
     * Change game state and handle side effects
     * @param {string} newState - New GameState value
     */
    changeState(newState) {
        const oldState = this.gameState;
        this.gameState = newState;
        
        // Handle state transition side effects
        if (newState === GameState.PLAYING && oldState === GameState.IDLE) {
            // Starting new game
            this.restart();
        } else if (newState === GameState.GAME_OVER) {
            // Game over - save high score if needed
            if (this.score > this.highScore) {
                this.highScore = this.score;
                // this.storage.setHighScore(this.highScore);
            }
        }
    }
    
    /**
     * Restart the game
     */
    restart() {
        this.score = 0;
        this.player.reset();
        this.pipeManager.reset();
        this.particles.reset();
        this.background.reset();
        this.changeState(GameState.PLAYING);
    }
    
    /**
     * Handle jump input
     */
    _handleJump() {
        // Initialize audio on first interaction
        if (!this.audio.isInitialized) {
            this.audio.init();
        }
        
        if (this.gameState === GameState.IDLE) {
            this.changeState(GameState.PLAYING);
            this.player.jump();
            this.audio.playJump();
        } else if (this.gameState === GameState.PLAYING) {
            this.player.jump();
            this.audio.playJump();
        } else if (this.gameState === GameState.GAME_OVER) {
            this.restart();
        }
    }
    
    /**
     * Handle pause input
     */
    _handlePause() {
        if (this.gameState === GameState.PLAYING) {
            this.changeState(GameState.PAUSED);
        } else if (this.gameState === GameState.PAUSED) {
            this.changeState(GameState.PLAYING);
        }
    }
    
    /**
     * Handle canvas click for UI interactions
     * @param {MouseEvent|TouchEvent} event
     */
    _handleClick(event) {
        event.preventDefault();
        
        // Initialize audio on first interaction
        if (!this.audio.isInitialized) {
            this.audio.init();
        }
        
        // Get click coordinates relative to canvas
        const rect = this.canvas.getBoundingClientRect();
        const clientX = event.clientX || (event.changedTouches && event.changedTouches[0].clientX);
        const clientY = event.clientY || (event.changedTouches && event.changedTouches[0].clientY);
        
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        // Scale coordinates to canvas space
        const canvasX = (x / rect.width) * this.canvas.width;
        const canvasY = (y / rect.height) * this.canvas.height;
        
        // Check button clicks
        const buttonIds = this.ui.getButtonIds();
        
        for (const buttonId of buttonIds) {
            if (this.ui.isButtonClicked(buttonId, canvasX, canvasY)) {
                this._handleButtonClick(buttonId, canvasX, canvasY);
                break;
            }
        }
    }
    
    /**
     * Handle button click
     * @param {string} buttonId
     * @param {number} x
     * @param {number} y
     * @private
     */
    _handleButtonClick(buttonId, x, y) {
        switch (buttonId) {
            case 'pause':
                this.changeState(GameState.PAUSED);
                break;
            case 'resume':
                this.changeState(GameState.PLAYING);
                break;
            case 'restart':
                this.restart();
                break;
            case 'menu':
                this.changeState(GameState.IDLE);
                break;
            case 'settings':
                this.changeState(GameState.SETTINGS);
                break;
            case 'close_settings':
                this.changeState(GameState.IDLE);
                break;
            case 'darkmode':
                this.darkMode = !this.darkMode;
                this.storage.setDarkMode(this.darkMode);
                break;
            case 'reset_highscore':
                this.storage.resetHighScore();
                this.highScore = 0;
                break;
            case 'volume':
                // Handle slider
                const newVolume = this.ui.getSliderValue('volume', x);
                this.volume = newVolume;
                this.audio.setVolume(newVolume);
                this.storage.setVolume(newVolume);
                break;
            default:
                // Check difficulty buttons
                if (buttonId.startsWith('difficulty_')) {
                    const newDifficulty = buttonId.replace('difficulty_', '');
                    this.difficulty = newDifficulty;
                    this.storage.setDifficulty(newDifficulty);
                    this.pipeManager.setDifficulty(newDifficulty);
                }
                break;
        }
    }
    
    /**
     * Handle window resize
     */
    _onResize() {
        const isMobile = window.innerWidth < 768 || window.innerHeight > window.innerWidth;
        
        let targetWidth, targetHeight;
        
        if (isMobile) {
            // Mobile: 9:16 aspect ratio (portrait)
            const aspectRatio = CONFIG.ASPECT_MOBILE[0] / CONFIG.ASPECT_MOBILE[1];
            targetWidth = window.innerWidth;
            targetHeight = window.innerWidth / aspectRatio;
            
            if (targetHeight > window.innerHeight) {
                targetHeight = window.innerHeight;
                targetWidth = targetHeight * aspectRatio;
            }
        } else {
            // Desktop: 4:3 aspect ratio (landscape)
            const aspectRatio = CONFIG.ASPECT_DESKTOP[0] / CONFIG.ASPECT_DESKTOP[1];
            targetWidth = window.innerWidth * 0.8;
            targetHeight = targetWidth / aspectRatio;
            
            if (targetHeight > window.innerHeight * 0.9) {
                targetHeight = window.innerHeight * 0.9;
                targetWidth = targetHeight * aspectRatio;
            }
        }
        
        this.canvas.width = Math.floor(targetWidth);
        this.canvas.height = Math.floor(targetHeight);
        
        // Update UI scale
        // this.ui?.setScale(1, 1);
    }
    
    /**
     * Check if device supports touch
     * @returns {boolean}
     */
    _isTouchDevice() {
        return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    }
    
    /**
     * Check collisions
     */
    _checkCollisions() {
        const collision = this.physics.checkCollisions(
            this.player,
            this.pipeManager.getPipes(),
            this.canvas.height
        );
        
        if (collision.hit) {
            // Play collision sound
            this.audio.playCollision();
            
            // Emit collision particles
            this.particles.emitCollision(this.player.x, this.player.y);
            
            // Change to game over state
            this.changeState(GameState.GAME_OVER);
            
            // Play game over sound
            setTimeout(() => this.audio.playGameOver(), 200);
        }
    }
    
    /**
     * Check scoring
     */
    _checkScoring() {
        const pipes = this.pipeManager.getPipes();
        
        for (const pipe of pipes) {
            // Check if player passed the pipe center
            if (!pipe.passed && this.player.x > pipe.x + pipe.width / 2) {
                pipe.passed = true;
                this.score++;
                
                // Play point sound
                this.audio.playPoint();
                
                // Emit point particles
                this.particles.emitPoint(this.player.x, this.player.y);
                
                // Increment difficulty
                this.pipeManager.incrementDifficulty(this.score);
            }
        }
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        // Cancel animation frame
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this._onResize);
        this.canvas.removeEventListener('click', this._handleClick);
        this.canvas.removeEventListener('touchend', this._handleClick);
        
        // Destroy subsystems
        this.input?.destroy();
        this.audio?.destroy();
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('gameCanvas');
    
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    const game = new Game(canvas);
    await game.init();
    game.start();
    
    // Make game accessible globally for debugging
    window.game = game;
});
