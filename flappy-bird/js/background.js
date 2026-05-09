/**
 * Background - Renders multi-layer parallax background
 * 
 * Creates depth perception by scrolling multiple layers at different
 * speeds relative to the pipe speed. Supports light and dark modes.
 */

export class Background {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.config = config;
        
        // Scroll offsets for each layer
        this.farOffset = 0;
        this.midOffset = 0;
        this.nearOffset = 0;
        
        // Layer speeds (as fraction of pipe speed)
        this.farSpeed = 0.20;
        this.midSpeed = 0.50;
        this.nearSpeed = 0.80;
    }
    
    /**
     * Update background scroll
     * @param {number} pipeSpeed - Current pipe speed in px/s
     * @param {number} deltaTime - Time elapsed in seconds
     */
    update(pipeSpeed, deltaTime) {
        // Update each layer offset
        this.farOffset += pipeSpeed * this.farSpeed * deltaTime;
        this.midOffset += pipeSpeed * this.midSpeed * deltaTime;
        this.nearOffset += pipeSpeed * this.nearSpeed * deltaTime;
        
        // Wrap offsets at canvas width
        const wrapWidth = this.canvas.width;
        this.farOffset %= wrapWidth;
        this.midOffset %= wrapWidth;
        this.nearOffset %= wrapWidth;
    }
    
    /**
     * Render background layers
     * @param {CanvasRenderingContext2D} ctx
     * @param {boolean} darkMode - Whether dark mode is enabled
     */
    render(ctx, darkMode) {
        // Sky gradient
        this._renderSky(ctx, darkMode);
        
        // Far clouds (slowest)
        this._renderFarClouds(ctx, darkMode);
        
        // Mid clouds (medium speed)
        this._renderMidClouds(ctx, darkMode);
        
        // Near hills/ground (fastest)
        this._renderNearLayer(ctx, darkMode);
        
        // Ground strip
        this._renderGround(ctx, darkMode);
    }
    
    /**
     * Render sky gradient
     * @param {CanvasRenderingContext2D} ctx
     * @param {boolean} darkMode
     * @private
     */
    _renderSky(ctx, darkMode) {
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        
        if (darkMode) {
            gradient.addColorStop(0, '#0a1128');
            gradient.addColorStop(1, '#1a2332');
        } else {
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#B0E0E6');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Render far clouds layer
     * @param {CanvasRenderingContext2D} ctx
     * @param {boolean} darkMode
     * @private
     */
    _renderFarClouds(ctx, darkMode) {
        const cloudColor = darkMode ? 'rgba(50, 60, 80, 0.3)' : 'rgba(255, 255, 255, 0.6)';
        const cloudY = this.canvas.height * 0.15;
        const cloudSpacing = 200;
        
        ctx.fillStyle = cloudColor;
        
        // Draw clouds with wrapping
        for (let i = -1; i < Math.ceil(this.canvas.width / cloudSpacing) + 1; i++) {
            const x = (i * cloudSpacing - this.farOffset) % (this.canvas.width + cloudSpacing);
            this._drawCloud(ctx, x, cloudY, 40, 20);
        }
    }
    
    /**
     * Render mid clouds layer
     * @param {CanvasRenderingContext2D} ctx
     * @param {boolean} darkMode
     * @private
     */
    _renderMidClouds(ctx, darkMode) {
        const cloudColor = darkMode ? 'rgba(70, 80, 100, 0.4)' : 'rgba(255, 255, 255, 0.8)';
        const cloudY = this.canvas.height * 0.25;
        const cloudSpacing = 180;
        
        ctx.fillStyle = cloudColor;
        
        // Draw clouds with wrapping
        for (let i = -1; i < Math.ceil(this.canvas.width / cloudSpacing) + 1; i++) {
            const x = (i * cloudSpacing - this.midOffset) % (this.canvas.width + cloudSpacing);
            this._drawCloud(ctx, x, cloudY, 50, 25);
        }
    }
    
    /**
     * Render near layer (hills)
     * @param {CanvasRenderingContext2D} ctx
     * @param {boolean} darkMode
     * @private
     */
    _renderNearLayer(ctx, darkMode) {
        const hillColor = darkMode ? '#1a3a1a' : '#90EE90';
        const hillY = this.canvas.height * 0.7;
        const hillSpacing = 150;
        
        ctx.fillStyle = hillColor;
        
        // Draw rolling hills with wrapping
        ctx.beginPath();
        ctx.moveTo(-this.nearOffset, hillY);
        
        for (let i = 0; i < Math.ceil(this.canvas.width / hillSpacing) + 2; i++) {
            const x = i * hillSpacing - this.nearOffset;
            const peakY = hillY - 40 - Math.sin(i * 0.5) * 20;
            
            ctx.quadraticCurveTo(
                x + hillSpacing / 2, peakY,
                x + hillSpacing, hillY
            );
        }
        
        ctx.lineTo(this.canvas.width, this.canvas.height);
        ctx.lineTo(0, this.canvas.height);
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * Render ground strip
     * @param {CanvasRenderingContext2D} ctx
     * @param {boolean} darkMode
     * @private
     */
    _renderGround(ctx, darkMode) {
        const groundHeight = 50;
        const groundY = this.canvas.height - groundHeight;
        
        // Ground base
        const groundGradient = ctx.createLinearGradient(0, groundY, 0, this.canvas.height);
        if (darkMode) {
            groundGradient.addColorStop(0, '#2a4a2a');
            groundGradient.addColorStop(1, '#1a3a1a');
        } else {
            groundGradient.addColorStop(0, '#8B7355');
            groundGradient.addColorStop(1, '#654321');
        }
        
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, groundY, this.canvas.width, groundHeight);
        
        // Ground pattern (grass tufts)
        ctx.fillStyle = darkMode ? '#1a3a1a' : '#6B8E23';
        const tufts = 20;
        for (let i = 0; i < tufts; i++) {
            const x = (i * (this.canvas.width / tufts) - this.nearOffset * 0.5) % this.canvas.width;
            const y = groundY + 5;
            
            ctx.fillRect(x, y, 3, 8);
            ctx.fillRect(x - 2, y + 3, 7, 3);
        }
    }
    
    /**
     * Draw a simple cloud shape
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Cloud width
     * @param {number} height - Cloud height
     * @private
     */
    _drawCloud(ctx, x, y, width, height) {
        ctx.beginPath();
        ctx.arc(x, y, height, 0, Math.PI * 2);
        ctx.arc(x + width / 3, y - height / 2, height * 0.8, 0, Math.PI * 2);
        ctx.arc(x + width * 2 / 3, y, height * 0.9, 0, Math.PI * 2);
        ctx.arc(x + width, y, height, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Reset all scroll offsets
     */
    reset() {
        this.farOffset = 0;
        this.midOffset = 0;
        this.nearOffset = 0;
    }
}
