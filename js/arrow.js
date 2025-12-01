export class Arrow {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.lifetime = 500; // Время жизни в миллисекундах
        this.createdAt = Date.now();
    }


    update(deltaTime) {
        this.lifetime = Math.max(0, this.lifetime - deltaTime);
    }


    render(ctx) {
        const progress = 1 - (this.lifetime / 500);
        const alpha = 1 - progress;


        ctx.save();
        ctx.globalAlpha = alpha;


        // Рисуем крестик как прицел
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;


        // Вертикальная линия
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size);
        ctx.lineTo(this.x, this.y + this.size);
        ctx.stroke();


        // Горизонтальная линия
        ctx.beginPath();
        ctx.moveTo(this.x - this.size, this.y);
        ctx.lineTo(this.x + this.size, this.y);
        ctx.stroke();


        // Круг в центре
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.stroke();


        ctx.restore();
    }
}
