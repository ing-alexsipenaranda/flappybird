/**
 * Player - Represents the bird character
 * 
 * Manages the bird's position, velocity, rotation, sprite animation,
 * and rendering. The bird sprite is drawn programmatically using
 * Canvas 2D API primitives.
 */

export class Player {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.config = config;
        
        // Player dimensions
        this.size = 34; // Base size in pixels
        
        // Position and velocity
        this.x = 0;
        this.y = 0;
        this.vy = 0; // Vertical velocity
        
        // Animation
        this.frameIndex = 0;
        this.frameTimer = 0;
        
        // Rotation (for visual feedback)
        this.rotation = 0;
        
        this.reset();
    }
    
    /**
     * Reset player to initial state
     */
    reset() {
        this.x = this.canvas.width * this.config.PLAYER_X_RATIO;
        this.y = this.canvas.height / 2;
        this.vy = 0;
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.rotation = 0;
    }
    
    /**
     * Update player animation
     * @param {number} deltaTime - Time elapsed in seconds
     */
    update(deltaTime) {
        // Update animation frame
        this.frameTimer += deltaTime;
        const frameDuration = 1 / this.config.SPRITE_FPS;
        
        if (this.frameTimer >= frameDuration) {
            this.frameTimer -= frameDuration;
            this.frameIndex = (this.frameIndex + 1) % this.config.SPRITE_FRAMES;
        }
        
        // Update rotation based on velocity
        // Rotate up when jumping, down when falling
        const targetRotation = Math.max(-Math.PI / 4, Math.min(Math.PI / 2, this.vy / 500));
        this.rotation = targetRotation;
    }
    
    /**
     * Make the player jump
     */
    jump() {
        this.vy = this.config.JUMP_VELOCITY;
    }
    
    /**
     * Get collision hitbox (shrunk for fairness)
     * @returns {{x: number, y: number, w: number, h: number}}
     */
    getBounds() {
        const hitboxSize = this.size * this.config.COLLISION_SHRINK;
        const offset = (this.size - hitboxSize) / 2;
        
        return {
            x: this.x - hitboxSize / 2 + offset,
            y: this.y - hitboxSize / 2 + offset,
            w: hitboxSize,
            h: hitboxSize,
        };
    }
    
    /**
     * Render the player sprite
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        ctx.save();
        
        // Translate to player position
        ctx.translate(this.x, this.y);
        
        // Apply rotation
        ctx.rotate(this.rotation);
        
        // Draw bird body (circle)
        ctx.fillStyle = '#FFD700'; // Golden yellow
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw bird outline
        ctx.strokeStyle = '#FFA500'; // Orange outline
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw eye
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.size / 4, -this.size / 6, this.size / 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.size / 4 + 2, -this.size / 6, this.size / 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw beak
        ctx.fillStyle = '#FF6347'; // Tomato red
        ctx.beginPath();
        ctx.moveTo(this.size / 2, 0);
        ctx.lineTo(this.size / 2 + 10, -3);
        ctx.lineTo(this.size / 2 + 10, 3);
        ctx.closePath();
        ctx.fill();
        
        // Draw wing (animated based on frameIndex)
        const wingOffsets = [
            { x: -this.size / 4, y: this.size / 4 },      // Frame 0: down
            { x: -this.size / 4, y: 0 },                  // Frame 1: mid
            { x: -this.size / 4, y: -this.size / 4 },     // Frame 2: up
        ];
        
        const wingOffset = wingOffsets[this.frameIndex];
        
        ctx.fillStyle = '#FFA500'; // Orange wing
        ctx.beginPath();
        ctx.ellipse(
            wingOffset.x, 
            wingOffset.y, 
            this.size / 3, 
            this.size / 4, 
            -Math.PI / 6, 
            0, 
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.restore();
        
        // Debug: Draw hitbox (uncomment for debugging)
        // const bounds = this.getBounds();
        // ctx.strokeStyle = '#FF0000';
        // ctx.lineWidth = 1;
        // ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
    }
}
