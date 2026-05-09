/**
 * ParticleSystem - Manages visual particle effects
 * 
 * Creates and updates short-lived particle effects for collisions
 * and scoring events. Particles fade out over their lifetime.
 */

export class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    /**
     * Emit collision particles (red/orange burst)
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    emitCollision(x, y) {
        const count = 12 + Math.floor(Math.random() * 5); // 12-16 particles
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = 100 + Math.random() * 100; // 100-200 px/s
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5 + Math.random() * 0.3, // 0.5-0.8s
                maxLife: 0.5 + Math.random() * 0.3,
                color: Math.random() > 0.5 ? '#FF4444' : '#FF8844',
                size: 3 + Math.random() * 3, // 3-6px
            });
        }
    }
    
    /**
     * Emit point scored particles (yellow/white burst)
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    emitPoint(x, y) {
        const count = 6 + Math.floor(Math.random() * 3); // 6-8 particles
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = 80 + Math.random() * 80; // 80-160 px/s
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 50, // Slight upward bias
                life: 0.3 + Math.random() * 0.2, // 0.3-0.5s
                maxLife: 0.3 + Math.random() * 0.2,
                color: Math.random() > 0.5 ? '#FFFF44' : '#FFFFFF',
                size: 2 + Math.random() * 2, // 2-4px
            });
        }
    }
    
    /**
     * Update all particles
     * @param {number} deltaTime - Time elapsed in seconds
     */
    update(deltaTime) {
        // Update each particle
        for (const particle of this.particles) {
            // Decrease lifetime
            particle.life -= deltaTime;
            
            // Update position
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            
            // Apply gravity to vertical velocity
            particle.vy += 500 * deltaTime; // Gravity effect
        }
        
        // Remove dead particles
        this.particles = this.particles.filter(p => p.life > 0);
    }
    
    /**
     * Render all particles
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        for (const particle of this.particles) {
            // Calculate alpha based on remaining life
            const alpha = particle.life / particle.maxLife;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }
    
    /**
     * Clear all particles
     */
    reset() {
        this.particles = [];
    }
    
    /**
     * Get number of active particles
     * @returns {number}
     */
    getCount() {
        return this.particles.length;
    }
}
