/**
 * PipeManager - Manages pipe obstacle generation and movement
 * 
 * Generates pipes procedurally, moves them across the screen,
 * and removes them when they go off-screen. Handles difficulty
 * progression by increasing speed based on score.
 */

export class PipeManager {
    constructor(canvas, config, difficulty = 'NORMAL') {
        this.canvas = canvas;
        this.config = config;
        
        // Pipe dimensions
        this.pipeWidth = 60;
        this.minGapFromEdge = 80; // Minimum distance from top/bottom
        
        // Active pipes
        this.pipes = [];
        
        // Spawn timing
        this.spawnTimer = 0;
        
        // Difficulty settings
        this.setDifficulty(difficulty);
    }
    
    /**
     * Set difficulty level
     * @param {'EASY'|'NORMAL'|'HARD'} difficulty
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        
        switch (difficulty) {
            case 'EASY':
                this.initialSpeed = this.config.PIPE_SPEED_EASY;
                this.spawnInterval = this.config.PIPE_INTERVAL_EASY;
                this.gap = this.config.GAP_EASY;
                break;
            case 'HARD':
                this.initialSpeed = this.config.PIPE_SPEED_HARD;
                this.spawnInterval = this.config.PIPE_INTERVAL_HARD;
                this.gap = this.config.GAP_HARD;
                break;
            case 'NORMAL':
            default:
                this.initialSpeed = this.config.PIPE_SPEED_NORMAL;
                this.spawnInterval = this.config.PIPE_INTERVAL_NORMAL;
                this.gap = this.config.GAP_NORMAL;
                break;
        }
        
        this.speed = this.initialSpeed;
    }
    
    /**
     * Reset pipe manager
     */
    reset() {
        this.pipes = [];
        this.spawnTimer = 0;
        this.speed = this.initialSpeed;
    }
    
    /**
     * Update pipes (spawn, move, remove)
     * @param {number} deltaTime - Time elapsed in seconds
     */
    update(deltaTime) {
        // Update spawn timer
        this.spawnTimer += deltaTime;
        
        // Spawn new pipe if timer exceeded
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer -= this.spawnInterval;
            this._spawnPipe();
        }
        
        // Move all pipes
        for (const pipe of this.pipes) {
            pipe.x -= this.speed * deltaTime;
        }
        
        // Remove off-screen pipes
        this.pipes = this.pipes.filter(pipe => pipe.x + this.pipeWidth > 0);
    }
    
    /**
     * Spawn a new pipe
     * @private
     */
    _spawnPipe() {
        // Calculate random gap position
        // Ensure gap is not too close to top or bottom
        const minGapTop = this.minGapFromEdge;
        const maxGapTop = this.canvas.height - this.gap - this.minGapFromEdge;
        
        const gapTop = minGapTop + Math.random() * (maxGapTop - minGapTop);
        const gapBottom = gapTop + this.gap;
        
        this.pipes.push({
            x: this.canvas.width,
            gapTop: gapTop,
            gapBottom: gapBottom,
            width: this.pipeWidth,
            passed: false,
        });
    }
    
    /**
     * Get all active pipes
     * @returns {Array}
     */
    getPipes() {
        return [...this.pipes]; // Return copy
    }
    
    /**
     * Increment difficulty based on score
     * @param {number} score - Current score
     */
    incrementDifficulty(score) {
        // Increase speed by PIPE_SPEED_INCREMENT every 10 points
        const speedIncrease = Math.floor(score / 10) * this.config.PIPE_SPEED_INCREMENT;
        this.speed = Math.min(
            this.initialSpeed + speedIncrease,
            this.config.PIPE_SPEED_MAX
        );
    }
    
    /**
     * Render all pipes
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        for (const pipe of this.pipes) {
            this._renderPipe(ctx, pipe);
        }
    }
    
    /**
     * Render a single pipe
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} pipe - Pipe object
     * @private
     */
    _renderPipe(ctx, pipe) {
        // Pipe colors
        const pipeGradient = ctx.createLinearGradient(
            pipe.x, 0, pipe.x + pipe.width, 0
        );
        pipeGradient.addColorStop(0, '#4CAF50');
        pipeGradient.addColorStop(0.5, '#66BB6A');
        pipeGradient.addColorStop(1, '#4CAF50');
        
        // Upper pipe
        ctx.fillStyle = pipeGradient;
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapTop);
        
        // Upper pipe cap
        ctx.fillRect(pipe.x - 5, pipe.gapTop - 30, pipe.width + 10, 30);
        
        // Lower pipe
        ctx.fillRect(pipe.x, pipe.gapBottom, pipe.width, this.canvas.height - pipe.gapBottom);
        
        // Lower pipe cap
        ctx.fillRect(pipe.x - 5, pipe.gapBottom, pipe.width + 10, 30);
        
        // Pipe borders
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 3;
        
        // Upper pipe border
        ctx.strokeRect(pipe.x, 0, pipe.width, pipe.gapTop);
        ctx.strokeRect(pipe.x - 5, pipe.gapTop - 30, pipe.width + 10, 30);
        
        // Lower pipe border
        ctx.strokeRect(pipe.x, pipe.gapBottom, pipe.width, this.canvas.height - pipe.gapBottom);
        ctx.strokeRect(pipe.x - 5, pipe.gapBottom, pipe.width + 10, 30);
        
        // Pipe highlights (for 3D effect)
        ctx.strokeStyle = '#81C784';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pipe.x + 5, 0);
        ctx.lineTo(pipe.x + 5, pipe.gapTop);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(pipe.x + 5, pipe.gapBottom);
        ctx.lineTo(pipe.x + 5, this.canvas.height);
        ctx.stroke();
    }
}
