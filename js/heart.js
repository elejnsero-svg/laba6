export class Heart {
    constructor(canvasWidth, canvasHeight, baseSpeed, redHeartChance = 0.1) {
        this.size = 35 + Math.random() * 25;
        this.direction = Math.random() > 0.5 ? 1 : -1;

        // Начальная позиция зависит от направления
        if (this.direction > 0) {
            this.x = -this.size;
        } else {
            this.x = canvasWidth + this.size;
        }

        this.y = Math.random() * (canvasHeight * 0.7) + canvasHeight * 0.15;
        this.speed = baseSpeed + Math.random() * 2;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.04;
        this.pulse = 0;
        this.pulseSpeed = 0.05;
        this.isExploding = false;
        this.explosionProgress = 0;
        this.scored = false; // Флаг, что очки уже начислены

        // Определяем тип сердца с учетом шанса красных сердец
        const heartType = Math.random();
        if (heartType < redHeartChance) {
            // Красное сердце
            this.color = '#DC143C';
            this.points = -2;
            this.glowColor = '#DC143C80';
        } else if (heartType < 0.4 + redHeartChance) {
            // Розовое сердце
            this.color = '#FF69B4';
            this.points = 5;
            this.glowColor = '#FF69B480';
        } else {
            // Фиолетовое сердце
            this.color = '#8A2BE2';
            this.points = 1;
            this.glowColor = '#8A2BE280';
        }
    }

    update(deltaTime) {
        if (!this.isExploding) {
            // Движение по горизонтали с ускорением
            this.x += this.speed * this.direction;
            this.rotation += this.rotationSpeed;
            this.pulse = Math.sin(Date.now() * this.pulseSpeed) * 0.2 + 1;

            // Небольшое вертикальное движение для реалистичности
            this.y += Math.sin(Date.now() * 0.001) * 0.5;
        } else {
            // Анимация взрыва
            this.explosionProgress += 0.08;
            this.pulse = 1 + this.explosionProgress * 3;
        }
    }

    explode() {
        if (!this.isExploding) {
            this.isExploding = true;
            this.explosionProgress = 0;
        }
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.pulse, this.pulse);

        if (this.isExploding) {
            ctx.globalAlpha = 1 - this.explosionProgress;

            // Эффект взрыва с частицами
            this.drawExplosionParticles(ctx);

            // Не рисуем сердце если взрыв почти завершен
            if (this.explosionProgress < 0.8) {
                this.drawHeart(ctx, 0, 0, this.size);
            }
        } else {
            // Рисуем сердце и свечение
            this.drawGlow(ctx);
            this.drawHeart(ctx, 0, 0, this.size);
        }

        ctx.restore();
    }

    drawHeart(ctx, x, y, size) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;

        ctx.beginPath();
        const topCurveHeight = size * 0.3;
        ctx.moveTo(x, y + size * 0.25);

        // Верхняя левая кривая
        ctx.bezierCurveTo(
            x, y,
            x - size * 0.5, y,
            x - size * 0.5, y + size * 0.25
        );

        // Нижняя левая кривая
        ctx.bezierCurveTo(
            x - size * 0.5, y + size * 0.5,
            x, y + size * 0.7,
            x, y + size
        );

        // Нижняя правая кривая
        ctx.bezierCurveTo(
            x, y + size * 0.7,
            x + size * 0.5, y + size * 0.5,
            x + size * 0.5, y + size * 0.25
        );

        // Верхняя правая кривая
        ctx.bezierCurveTo(
            x + size * 0.5, y,
            x, y,
            x, y + size * 0.25
        );

        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    drawGlow(ctx) {
        const gradient = ctx.createRadialGradient(0, 0, this.size * 0.5, 0, 0, this.size * 1.5);
        gradient.addColorStop(0, this.glowColor);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawExplosionParticles(ctx) {
        const particleCount = 12;
        const particleSize = this.size * 0.15;

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = this.explosionProgress * this.size * 3;
            const px = Math.cos(angle) * distance;
            const py = Math.sin(angle) * distance;

            const particleAlpha = 1 - this.explosionProgress;
            ctx.fillStyle = this.color;
            ctx.globalAlpha = particleAlpha;

            ctx.beginPath();
            ctx.arc(px, py, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1 - this.explosionProgress;
    }
}