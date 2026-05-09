/**
 * UI - Renders all game screens and HUD elements
 * 
 * Handles rendering of IDLE, PLAYING, PAUSED, GAME_OVER, and SETTINGS screens.
 * All positions are computed relative to canvas dimensions for responsive scaling.
 */

export class UI {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.config = config;
        this.ctx = canvas.getContext('2d');
        
        // Scale factors (for responsive design)
        this.scaleX = 1;
        this.scaleY = 1;
        
        // Button regions (for click detection)
        this.buttons = {};
    }
    
    /**
     * Set scale factors for responsive design
     * @param {number} scaleX - Horizontal scale factor
     * @param {number} scaleY - Vertical scale factor
     */
    setScale(scaleX, scaleY) {
        this.scaleX = scaleX;
        this.scaleY = scaleY;
    }
    
    /**
     * Main render method - delegates to appropriate screen
     * @param {string} gameState - Current game state
     * @param {number} score - Current score
     * @param {number} highScore - High score
     * @param {boolean} darkMode - Dark mode enabled
     * @param {string} difficulty - Current difficulty
     * @param {boolean} isTouchDevice - Is touch device
     * @param {number} volume - Current volume (0-1)
     */
    render(gameState, score, highScore, darkMode, difficulty, isTouchDevice, volume = 0.8) {
        this.buttons = {}; // Reset button regions
        
        switch (gameState) {
            case 'IDLE':
                this.renderIdle(highScore, difficulty, darkMode, isTouchDevice);
                break;
            case 'PLAYING':
                this.renderHUD(score);
                break;
            case 'PAUSED':
                this.renderPaused();
                break;
            case 'GAME_OVER':
                this.renderGameOver(score, highScore);
                break;
            case 'SETTINGS':
                this.renderSettings(volume, difficulty, darkMode, highScore);
                break;
        }
    }
    
    /**
     * Render HUD during gameplay
     * @param {number} score
     */
    renderHUD(score) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Score display
        ctx.save();
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        const scoreText = score.toString();
        const scoreX = w / 2;
        const scoreY = h * 0.1;
        
        ctx.strokeText(scoreText, scoreX, scoreY);
        ctx.fillText(scoreText, scoreX, scoreY);
        ctx.restore();
        
        // Pause button (top-right)
        const pauseSize = 40;
        const pauseX = w - pauseSize - 20;
        const pauseY = 20;
        
        this._drawButton(ctx, pauseX, pauseY, pauseSize, pauseSize, '⏸', 'pause');
    }
    
    /**
     * Render IDLE screen
     * @param {number} highScore
     * @param {string} difficulty
     * @param {boolean} darkMode
     * @param {boolean} isTouchDevice
     */
    renderIdle(highScore, difficulty, darkMode, isTouchDevice) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Title
        ctx.save();
        ctx.font = 'bold 64px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.strokeText('FLAPPY BIRD', w / 2, h * 0.2);
        ctx.fillText('FLAPPY BIRD', w / 2, h * 0.2);
        ctx.restore();
        
        // High score
        ctx.save();
        ctx.font = '24px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(`Récord: ${highScore}`, w / 2, h * 0.32);
        ctx.restore();
        
        // Difficulty selector
        ctx.save();
        ctx.font = '20px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText('Dificultad:', w / 2, h * 0.45);
        ctx.restore();
        
        const difficultyButtons = ['EASY', 'NORMAL', 'HARD'];
        const buttonWidth = 100;
        const buttonHeight = 40;
        const buttonSpacing = 20;
        const totalWidth = difficultyButtons.length * buttonWidth + (difficultyButtons.length - 1) * buttonSpacing;
        const startX = (w - totalWidth) / 2;
        const buttonY = h * 0.52;
        
        difficultyButtons.forEach((diff, index) => {
            const x = startX + index * (buttonWidth + buttonSpacing);
            const isSelected = diff === difficulty;
            this._drawButton(
                ctx, x, buttonY, buttonWidth, buttonHeight,
                diff, `difficulty_${diff}`,
                isSelected ? '#4CAF50' : '#666666'
            );
        });
        
        // Dark mode toggle
        const toggleX = w / 2 - 60;
        const toggleY = h * 0.65;
        ctx.save();
        ctx.font = '18px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'right';
        ctx.fillText('Modo oscuro:', toggleX - 10, toggleY + 15);
        ctx.restore();
        
        this._drawToggle(ctx, toggleX + 10, toggleY, darkMode, 'darkmode');
        
        // Settings button
        this._drawButton(ctx, w / 2 - 60, h * 0.75, 120, 40, '⚙ Ajustes', 'settings');
        
        // Start instruction
        ctx.save();
        ctx.font = '20px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        const instruction = isTouchDevice ? 'Toca para empezar' : 'Presiona ESPACIO para empezar';
        ctx.fillText(instruction, w / 2, h * 0.88);
        ctx.restore();
    }
    
    /**
     * Render PAUSED screen
     */
    renderPaused() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, w, h);
        
        // "PAUSED" text
        ctx.save();
        ctx.font = 'bold 56px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.strokeText('PAUSA', w / 2, h * 0.3);
        ctx.fillText('PAUSA', w / 2, h * 0.3);
        ctx.restore();
        
        // Buttons
        const buttonWidth = 180;
        const buttonHeight = 50;
        const buttonX = (w - buttonWidth) / 2;
        
        this._drawButton(ctx, buttonX, h * 0.45, buttonWidth, buttonHeight, '▶ Reanudar', 'resume');
        this._drawButton(ctx, buttonX, h * 0.55, buttonWidth, buttonHeight, '🔄 Reiniciar', 'restart');
        this._drawButton(ctx, buttonX, h * 0.65, buttonWidth, buttonHeight, '🏠 Menú', 'menu');
    }
    
    /**
     * Render GAME_OVER screen
     * @param {number} score
     * @param {number} highScore
     */
    renderGameOver(score, highScore) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, w, h);
        
        // "GAME OVER" text
        ctx.save();
        ctx.font = 'bold 56px Arial';
        ctx.fillStyle = '#FF4444';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.strokeText('GAME OVER', w / 2, h * 0.25);
        ctx.fillText('GAME OVER', w / 2, h * 0.25);
        ctx.restore();
        
        // Score
        ctx.save();
        ctx.font = '32px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(`Puntuación: ${score}`, w / 2, h * 0.4);
        ctx.restore();
        
        // High score
        ctx.save();
        ctx.font = '28px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        const isNewRecord = score >= highScore && score > 0;
        const highScoreText = isNewRecord ? `¡Nuevo récord! ${highScore}` : `Récord: ${highScore}`;
        ctx.fillText(highScoreText, w / 2, h * 0.5);
        ctx.restore();
        
        // Buttons
        const buttonWidth = 180;
        const buttonHeight = 50;
        const buttonX = (w - buttonWidth) / 2;
        
        this._drawButton(ctx, buttonX, h * 0.62, buttonWidth, buttonHeight, '🔄 Reiniciar', 'restart');
        this._drawButton(ctx, buttonX, h * 0.72, buttonWidth, buttonHeight, '🏠 Menú', 'menu');
    }
    
    /**
     * Render SETTINGS screen
     * @param {number} volume
     * @param {string} difficulty
     * @param {boolean} darkMode
     * @param {number} highScore
     */
    renderSettings(volume, difficulty, darkMode, highScore) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, w, h);
        
        // Title
        ctx.save();
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText('AJUSTES', w / 2, h * 0.15);
        ctx.restore();
        
        // Volume slider
        ctx.save();
        ctx.font = '24px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.fillText('Volumen:', w * 0.2, h * 0.3);
        ctx.restore();
        
        this._drawSlider(ctx, w * 0.2, h * 0.35, w * 0.6, 10, volume, 'volume');
        
        // Difficulty
        ctx.save();
        ctx.font = '24px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.fillText('Dificultad:', w * 0.2, h * 0.48);
        ctx.restore();
        
        const difficultyButtons = ['EASY', 'NORMAL', 'HARD'];
        const buttonWidth = 90;
        const buttonHeight = 35;
        const buttonSpacing = 15;
        const startX = w * 0.2;
        const buttonY = h * 0.53;
        
        difficultyButtons.forEach((diff, index) => {
            const x = startX + index * (buttonWidth + buttonSpacing);
            const isSelected = diff === difficulty;
            this._drawButton(
                ctx, x, buttonY, buttonWidth, buttonHeight,
                diff, `difficulty_${diff}`,
                isSelected ? '#4CAF50' : '#666666'
            );
        });
        
        // Dark mode
        ctx.save();
        ctx.font = '24px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.fillText('Modo oscuro:', w * 0.2, h * 0.66);
        ctx.restore();
        
        this._drawToggle(ctx, w * 0.55, h * 0.63, darkMode, 'darkmode');
        
        // Reset high score
        this._drawButton(ctx, w * 0.2, h * 0.75, w * 0.6, 40, '🗑 Reiniciar récord', 'reset_highscore');
        
        // Close button
        this._drawButton(ctx, w / 2 - 60, h * 0.88, 120, 45, '✕ Cerrar', 'close_settings');
    }
    
    /**
     * Draw a button
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {string} text
     * @param {string} id - Button identifier
     * @param {string} color - Button color
     * @private
     */
    _drawButton(ctx, x, y, width, height, text, id, color = '#4CAF50') {
        // Store button region for click detection
        this.buttons[id] = { x, y, width, height };
        
        // Button background
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
        
        // Button border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Button text
        ctx.save();
        ctx.font = '20px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + width / 2, y + height / 2);
        ctx.restore();
    }
    
    /**
     * Draw a toggle switch
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x
     * @param {number} y
     * @param {boolean} state
     * @param {string} id
     * @private
     */
    _drawToggle(ctx, x, y, state, id) {
        const width = 60;
        const height = 30;
        
        // Store button region
        this.buttons[id] = { x, y, width, height };
        
        // Toggle background
        ctx.fillStyle = state ? '#4CAF50' : '#666666';
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Toggle knob
        const knobX = state ? x + width - height + 5 : x + 5;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(knobX, y + 5, height - 10, height - 10);
    }
    
    /**
     * Draw a slider
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {number} value - Value between 0 and 1
     * @param {string} id
     * @private
     */
    _drawSlider(ctx, x, y, width, height, value, id) {
        // Store slider region
        this.buttons[id] = { x: x - 10, y: y - 10, width: width + 20, height: height + 20 };
        
        // Slider track
        ctx.fillStyle = '#666666';
        ctx.fillRect(x, y, width, height);
        
        // Slider fill
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(x, y, width * value, height);
        
        // Slider handle
        const handleX = x + width * value;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(handleX, y + height / 2, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Value text
        ctx.save();
        ctx.font = '18px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(value * 100)}%`, x + width / 2, y + height + 25);
        ctx.restore();
    }
    
    /**
     * Check if a point is inside a button
     * @param {string} buttonId
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    isButtonClicked(buttonId, x, y) {
        const button = this.buttons[buttonId];
        if (!button) return false;
        
        return x >= button.x && x <= button.x + button.width &&
               y >= button.y && y <= button.y + button.height;
    }
    
    /**
     * Get all button IDs
     * @returns {Array<string>}
     */
    getButtonIds() {
        return Object.keys(this.buttons);
    }
    
    /**
     * Get slider value from click position
     * @param {string} sliderId
     * @param {number} x
     * @returns {number} - Value between 0 and 1
     */
    getSliderValue(sliderId, x) {
        const slider = this.buttons[sliderId];
        if (!slider) return 0;
        
        const relativeX = x - slider.x;
        const value = relativeX / slider.width;
        return Math.max(0, Math.min(1, value));
    }
}
