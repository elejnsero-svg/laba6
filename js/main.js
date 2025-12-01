import { Game } from './game.js';

class App {
    constructor() {
        this.game = null;
        this.currentLevel = 1;
        this.maxLevel = 3;
        this.levelScores = [0, 0, 0];
        this.unlockedLevels = 1;
        this.tips = [
            "Купидон!Беда! Наше любовное зелье пролилось на город!",
            "Помоги исцелить людей.Бери стрелы антилюбви и спускайся.",
            "Стреляй по розовым и фиолетовым сердцам. Красные не заражены"
        ];
        this.tipIndex = 0;

        this.init();
    }

    init() {
        this.screens = {
            loading: document.getElementById('loadingScreen'),
            menu: document.getElementById('menuScreen'),
            levelSelect: document.getElementById('levelSelectScreen'),
            game: document.getElementById('gameScreen'),
            gameOver: document.getElementById('gameOverScreen'),
            tip: document.getElementById('tipScreen')
        };

        this.elements = {
            playButton: document.getElementById('playButton'),
            restartButton: document.getElementById('restartButton'),
            menuButton: document.getElementById('menuButton'),
            backToMenuButton: document.getElementById('backToMenuButton'),
            nextLevelButton: document.getElementById('nextLevelButton'),
            replayLevelButton: document.getElementById('replayLevelButton'),
            resetProgressButton: document.getElementById('resetProgressButton'),
            level1: document.getElementById('level1'),
            level2: document.getElementById('level2'),
            level3: document.getElementById('level3'),
            level1Score: document.getElementById('level1Score'),
            level2Score: document.getElementById('level2Score'),
            level3Score: document.getElementById('level3Score'),
            currentLevel: document.getElementById('currentLevel'),
            score: document.getElementById('score'),
            timer: document.getElementById('timer'),
            finalScore: document.getElementById('finalScore'),
            levelUnlockMessage: document.getElementById('levelUnlockMessage'),
            gameOverTitle: document.getElementById('gameOverTitle'),
            unlockedLevels: document.getElementById('unlockedLevels'),
            progressBar: document.getElementById('progressBar'),
            loadingText: document.getElementById('loadingText'),
            currentTip: document.getElementById('currentTip'),
            loadingImage: document.getElementById('loadingImage')
        };

        this.loadProgress();
        this.setupEventListeners();
        this.startLoading();
    }

    startLoading() {
        let progress = 0;
        const loadingSteps = [
            {text: "Загрузка изображений...", progress: 20},
            {text: "Подготовка игры...", progress: 40},
            {text: "Загрузка уровней...", progress: 60},
            {text: "Подготовка сердец...", progress: 80},
            {text: "Готово! Запуск игры...", progress: 100}
        ];

        // Предзагрузка изображения
        const preloadImage = new Image();
        preloadImage.onload = () => {
            this.elements.loadingImage.src = preloadImage.src;
        };
        preloadImage.src = 'https://images.unsplash.com/photo-1541417904950-b855846fe074?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

        let step = 0;
        const interval = setInterval(() => {
            if (step < loadingSteps.length) {
                this.elements.loadingText.textContent = loadingSteps[step].text;
                progress = loadingSteps[step].progress;
                this.elements.progressBar.style.width = `${progress}%`;
                step++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    this.showTipScreen();
                }, 500);
            }
        }, 800);
    }

    showTipScreen() {
        this.hideAllScreens();
        this.screens.tip.classList.remove('hidden');

        // Показываем 4 совета по очереди
        this.showNextTip(0);
    }

    showNextTip(index) {
        if (index >= 4) {
            this.showMenu();
            return;
        }

        this.elements.currentTip.textContent = this.tips[this.tipIndex];
        this.tipIndex = (this.tipIndex + 1) % this.tips.length;

        setTimeout(() => {
            this.showNextTip(index + 1);
        }, 3000);
    }

    setupEventListeners() {
        this.elements.playButton.addEventListener('click', () => this.showLevelSelect());
        this.elements.restartButton.addEventListener('click', () => this.showLevelSelect());
        this.elements.menuButton.addEventListener('click', () => this.showMenu());
        this.elements.backToMenuButton.addEventListener('click', () => this.showMenu());
        this.elements.nextLevelButton.addEventListener('click', () => this.startNextLevel());
        this.elements.replayLevelButton.addEventListener('click', () => this.startGame(this.currentLevel));
        this.elements.resetProgressButton.addEventListener('click', () => this.resetProgress());

        this.elements.level1.addEventListener('click', () => {
            if (!this.elements.level1.classList.contains('level-locked')) {
                this.startGame(1);
            }
        });

        this.elements.level2.addEventListener('click', () => {
            if (!this.elements.level2.classList.contains('level-locked')) {
                this.startGame(2);
            }
        });

        this.elements.level3.addEventListener('click', () => {
            if (!this.elements.level3.classList.contains('level-locked')) {
                this.startGame(3);
            }
        });
    }

    loadProgress() {
        const savedProgress = localStorage.getItem('heartHunterProgress');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            this.levelScores = progress.scores || [0, 0, 0];
            this.unlockedLevels = progress.unlockedLevels || 1;
        }
        this.updateLevelSelect();
    }

    saveProgress() {
        const progress = {
            scores: this.levelScores,
            unlockedLevels: this.unlockedLevels
        };
        localStorage.setItem('heartHunterProgress', JSON.stringify(progress));
    }

    resetProgress() {
        if (confirm("Вы уверены, что хотите начать новую игу? Все прогресс будет сброшен.")) {
            this.levelScores = [0, 0, 0];
            this.unlockedLevels = 1;
            localStorage.removeItem('heartHunterProgress');
            this.updateLevelSelect();
            alert("Прогресс сброшен! Начинайте новую игру.");
        }
    }

    updateLevelSelect() {
        // Обновляем лучшие результаты
        this.elements.level1Score.textContent = `Лучший: ${this.levelScores[0]}`;
        this.elements.level2Score.textContent = this.unlockedLevels >= 2 ?
            `Лучший: ${this.levelScores[1]}` : 'Заблокирован';
        this.elements.level3Score.textContent = this.unlockedLevels >= 3 ?
            `Лучший: ${this.levelScores[2]}` : 'Заблокирован';

        // Разблокируем уровни
        if (this.unlockedLevels >= 2) {
            this.elements.level2.classList.remove('level-locked');
        } else {
            this.elements.level2.classList.add('level-locked');
        }

        if (this.unlockedLevels >= 3) {
            this.elements.level3.classList.remove('level-locked');
        } else {
            this.elements.level3.classList.add('level-locked');
        }

        this.elements.unlockedLevels.textContent = this.unlockedLevels;
    }

    showMenu() {
        this.hideAllScreens();
        this.screens.menu.classList.remove('hidden');
        this.updateLevelSelect();
    }

    showLevelSelect() {
        this.hideAllScreens();
        this.screens.levelSelect.classList.remove('hidden');
        this.updateLevelSelect();
    }

    startGame(level) {
        this.currentLevel = level;
        this.hideAllScreens();
        this.screens.game.classList.remove('hidden');

        if (this.game) {
            this.game.cleanup();
        }

        this.game = new Game(level);
        this.game.start();

        this.elements.currentLevel.textContent = level;

        this.game.onGameOver = (score, success) => {
            this.handleGameOver(score, success);
        };
    }

    handleGameOver(score, success) {
        // Сохраняем лучший результат только если он выше текущего
        const currentBest = this.levelScores[this.currentLevel - 1];
        if (score > currentBest) {
            this.levelScores[this.currentLevel - 1] = score;
            this.saveProgress();
        }

        // Проверяем, нужно ли разблокировать следующий уровень
        let nextLevelUnlocked = false;
        if (success && this.currentLevel < this.maxLevel && this.unlockedLevels <= this.currentLevel) {
            this.unlockedLevels = this.currentLevel + 1;
            this.saveProgress();
            nextLevelUnlocked = true;
        }

        this.showGameOver(score, nextLevelUnlocked);
    }

    showGameOver(score, nextLevelUnlocked) {
        this.hideAllScreens();
        this.screens.gameOver.classList.remove('hidden');

        this.elements.finalScore.textContent = score;

        if (nextLevelUnlocked) {
            this.elements.levelUnlockMessage.textContent = `🎉 Поздравляем! Уровень ${this.currentLevel + 1} разблокирован!`;
            this.elements.nextLevelButton.style.display = 'block';
        } else {
            this.elements.levelUnlockMessage.textContent = '';
            this.elements.nextLevelButton.style.display = 'none';
        }

        // Определяем заголовок в зависимости от результата
        if (score >= 300) {
            this.elements.gameOverTitle.textContent = "Потрясающе! 💫";
        } else if (score >= 200) {
            this.elements.gameOverTitle.textContent = "Отличная игра! ⭐";
        } else if (score >= 100) {
            this.elements.gameOverTitle.textContent = "Хороший результат! 👍";
        } else {
            this.elements.gameOverTitle.textContent = "Попробуйте ещё раз! 💪";
        }
    }

    startNextLevel() {
        if (this.currentLevel < this.maxLevel) {
            this.startGame(this.currentLevel + 1);
        }
    }

    hideAllScreens() {
        for (const screen of Object.values(this.screens)) {
            screen.classList.add('hidden');
        }
    }
}

new App();