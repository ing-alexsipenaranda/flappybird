/**
 * Physics - Handles gravity application and collision detection
 * 
 * Applies gravitational acceleration to the player and performs
 * AABB (Axis-Aligned Bounding Box) collision detection between
 * the player and pipes/floor.
 */

export class Physics {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.config = config;
    }
    
    /**
     * Update player physics (apply gravity and clamp to boundaries)
     * @param {Player} player - Player instance
     * @param {number} deltaTime - Time elapsed in seconds
     */
    update(player, deltaTime) {
        // Apply gravity to vertical velocity
        player.vy += this.config.GRAVITY * deltaTime;
        
        // Update vertical position
        player.y += player.vy * deltaTime;
        
        // Clamp to top boundary
        if (player.y <= 0) {
            player.y = 0;
            player.vy = 0;
        }
    }
    
    /**
     * Check collisions between player and pipes/floor
     * @param {Player} player - Player instance
     * @param {Array} pipes - Array of pipe objects
     * @param {number} canvasHeight - Canvas height
     * @returns {{hit: boolean, type: 'pipe'|'floor'|null}}
     */
    checkCollisions(player, pipes, canvasHeight) {
        // Get player hitbox (shrunk for fairness)
        const playerBounds = player.getBounds();
        
        // Check floor collision
        if (playerBounds.y + playerBounds.h >= canvasHeight) {
            return { hit: true, type: 'floor' };
        }
        
        // Check pipe collisions
        for (const pipe of pipes) {
            // Only check pipes that are near the player
            if (pipe.x + pipe.width < playerBounds.x - 50 || 
                pipe.x > playerBounds.x + playerBounds.w + 50) {
                continue;
            }
            
            // Check collision with upper pipe segment
            if (this._aabbIntersect(
                playerBounds.x, playerBounds.y, playerBounds.w, playerBounds.h,
                pipe.x, 0, pipe.width, pipe.gapTop
            )) {
                return { hit: true, type: 'pipe' };
            }
            
            // Check collision with lower pipe segment
            if (this._aabbIntersect(
                playerBounds.x, playerBounds.y, playerBounds.w, playerBounds.h,
                pipe.x, pipe.gapBottom, pipe.width, canvasHeight - pipe.gapBottom
            )) {
                return { hit: true, type: 'pipe' };
            }
        }
        
        return { hit: false, type: null };
    }
    
    /**
     * AABB (Axis-Aligned Bounding Box) intersection test
     * @param {number} x1 - First box X
     * @param {number} y1 - First box Y
     * @param {number} w1 - First box width
     * @param {number} h1 - First box height
     * @param {number} x2 - Second box X
     * @param {number} y2 - Second box Y
     * @param {number} w2 - Second box width
     * @param {number} h2 - Second box height
     * @returns {boolean}
     * @private
     */
    _aabbIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 &&
               x1 + w1 > x2 &&
               y1 < y2 + h2 &&
               y1 + h1 > y2;
    }
}
