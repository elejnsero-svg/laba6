import { Heart } from './heart.js';
import { Arrow } from './arrow.js';

export class Game {
    constructor(level = 1) {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');

        this.level = level;

        // Настройки в зависимости от уровня
        this.levelSettings = {
            1: {
                baseSpeed: 2,
                speedMultiplier: 1,
                redHeartChance: 0.1,
                heartInterval: 1500,
                requiredScore: 100
            },
            2: {
                baseSpeed: 3,
                speedMultiplier: 1.3,
                redHeartChance: 0.2,
                heartInterval: 1200,
                requiredScore: 120
            },
            3: {
                baseSpeed: 4,
                speedMultiplier: 1.6,
                redHeartChance: 0.3,
                heartInterval: 900,
                requiredScore: 150
            }
        };

        // Загрузка фонового изображения
        this.background = new Image();
        this.background.src = 'https://i.postimg.cc/FRn5P9M4/sd-ultra-In-the-garden-of-love-a-43799292.png';
        this.background.onload = () => {
            this.backgroundLoaded = true;
        };

        this.setupCanvas();
        this.reset();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    reset() {
        const settings = this.levelSettings[this.level];

        this.score = 0;
        this.timeLeft = 60;
        this.hearts = [];
        this.arrows = [];
        this.isRunning = false;
        this.lastHeartTime = 0;
        this.heartInterval = settings.heartInterval;
        this.redHeartChance = settings.redHeartChance;
        this.baseSpeed = settings.baseSpeed;
        this.speedMultiplier = settings.speedMultiplier;
        this.requiredScore = settings.requiredScore;
        this.backgroundLoaded = false;

        this.updateScore();
        this.updateTimer();
    }

    start() {
        this.reset();
        this.isRunning = true;
        this.setupEventListeners();
        this.gameLoop();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }

    setupEventListeners() {
        this.clickHandler = (event) => this.handleClick(event);
        this.canvas.addEventListener('click', this.clickHandler);
    }

    handleClick(event) {
        if (!this.isRunning) return;

        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        // Создаем стрелу
        const arrow = new Arrow(clickX, clickY);
        this.arrows.push(arrow);

        // Проверяем попадание в сердца
        for (let i = this.hearts.length - 1; i >= 0; i--) {
            const heart = this.hearts[i];

            // Проверяем, не взорвано ли уже это сердце
            if (heart.isExploding || heart.scored) continue;

            if (this.checkCollision(clickX, clickY, heart)) {
                // Помечаем, что очки за это сердце уже начислены
                heart.scored = true;

                // Добавляем/убираем очки
                this.score += heart.points;
                this.updateScore();

                // Запускаем анимацию взрыва
                heart.explode();

                // Удаляем сердце после взрыва
                setTimeout(() => {
                    const index = this.hearts.indexOf(heart);
                    if (index > -1) {
                        this.hearts.splice(index, 1);
                    }
                }, 300);

                break;
            }
        }
    }

    checkCollision(x, y, heart) {
        const dx = x - heart.x;
        const dy = y - heart.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < heart.size;
    }

    spawnHeart(timestamp) {
        if (timestamp - this.lastHeartTime > this.heartInterval) {
            const heart = new Heart(
                this.canvas.width,
                this.canvas.height,
                this.baseSpeed * this.speedMultiplier,
                this.redHeartChance
            );
            this.hearts.push(heart);
            this.lastHeartTime = timestamp;

            // Уменьшаем интервал для увеличения сложности
            this.heartInterval = Math.max(500, this.heartInterval * 0.995);
        }
    }

    updateHearts(deltaTime) {
        for (let i = this.hearts.length - 1; i >= 0; i--) {
            const heart = this.hearts[i];
            heart.update(deltaTime);

            // Удаляем сердца, вышедшие за пределы экрана
            if ((heart.direction > 0 && heart.x > this.canvas.width + 50) ||
                (heart.direction < 0 && heart.x < -50)) {
                this.hearts.splice(i, 1);
            }
        }
    }

    updateArrows(deltaTime) {
        for (let i = this.arrows.length - 1; i >= 0; i--) {
            const arrow = this.arrows[i];
            arrow.update(deltaTime);

            // Удаляем стрелы после анимации
            if (arrow.lifetime <= 0) {
                this.arrows.splice(i, 1);
            }
        }
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    updateTimer() {
        if (!this.isRunning) return;

        this.timeLeft--;
        this.timerElement.textContent = this.timeLeft;

        if (this.timeLeft <= 0) {
            this.endGame();
        }
    }

    render() {
        // Очищаем canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Рисуем фон если загружен
        if (this.backgroundLoaded) {
            this.ctx.drawImage(this.background, 0, 0, this.canvas.width, this.canvas.height);

            // Добавляем затемнение для лучшей видимости сердец
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Градиентный фон пока изображение грузится
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#1a2980');
            gradient.addColorStop(1, '#26d0ce');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Рендерим сердца (взорванные сердца тоже рендерим для анимации)
        this.hearts.forEach(heart => heart.render(this.ctx));

        // Рендерим стрелы
        this.arrows.forEach(arrow => arrow.render(this.ctx));

        // Отображаем информацию об уровне
        this.renderLevelInfo();
    }

    renderLevelInfo() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(20, this.canvas.height - 100, 350, 80);
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 22px Arial';
        this.ctx.fillText(`Уровень ${this.level}`, 40, this.canvas.height - 70);
        this.ctx.fillText(`Цель: ${this.requiredScore} очков`, 40, this.canvas.height - 40);

        // Прогресс до цели
        const progress = Math.min(this.score / this.requiredScore, 1);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(40, this.canvas.height - 20, 260, 10);
        this.ctx.fillStyle = this.score >= this.requiredScore ? '#4CAF50' : '#FF6B6B';
        this.ctx.fillRect(40, this.canvas.height - 20, 260 * progress, 10);
    }

    gameLoop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = timestamp - (this.lastTimestamp || timestamp);
        this.lastTimestamp = timestamp;

        this.spawnHeart(timestamp);
        this.updateHearts(deltaTime);
        this.updateArrows(deltaTime);
        this.render();

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    endGame() {
        this.isRunning = false;
        clearInterval(this.timerInterval);

        const success = this.score >= this.levelSettings[this.level].requiredScore;

        if (this.onGameOver) {
            this.onGameOver(this.score, success);
        }
    }

    cleanup() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        if (this.clickHandler) {
            this.canvas.removeEventListener('click', this.clickHandler);
        }
    }
}