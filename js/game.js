class MainScene extends Phaser.Scene {
    constructor() { super('MainScene'); }

    preload() {
        this.load.image('bg', 'https://labs.phaser.io/assets/skies/gradient24.png');
        this.load.image('floor', 'https://labs.phaser.io/assets/sprites/platform.png');
        this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('bomb', 'https://labs.phaser.io/assets/sprites/bomb.png'); // L'IMAGE DE LA BOMBE
        this.load.image('laser', 'https://labs.phaser.io/assets/sprites/longarrow.png');
        this.load.image('coin', 'https://labs.phaser.io/assets/sprites/apple.png');
        if (typeof loadAudio === 'function') loadAudio(this);
    }

    create() {
        isGameOver = false;
        lives = SETTINGS.initialLives;
        this.gameSpeed = SETTINGS.startSpeed;
        this.isInvincible = false;
        
        if (typeof createWorld === 'function') createWorld(this);
        if (typeof createPlayer === 'function') player = createPlayer(this);
        if (typeof initAudio === 'function') initAudio(this);

        obstacles = this.physics.add.group();
        coins = this.physics.add.group();

        this.livesText = this.add.text(650, 20, '❤️❤️❤️', { fontSize: '32px' });

        this.time.addEvent({ delay: SETTINGS.spawnDelay, callback: () => spawnObstacle(this), loop: true });
        this.time.addEvent({ delay: 800, callback: () => spawnCoin(this), loop: true });

        this.input.on('pointerdown', () => { if(player) player.setAccelerationY(SETTINGS.thrust); });
        this.input.on('pointerup', () => { if(player) player.setAccelerationY(0); });

        this.physics.add.overlap(player, obstacles, (p, obs) => {
            if (typeof handleHit === 'function') handleHit(this, p, obs);
        });
        
        this.physics.add.overlap(player, coins, (p, c) => {
            c.destroy();
            if (typeof playPop === 'function') playPop(this);
        });
    }

    updateLivesUI() {
        let display = "";
        for(let i = 0; i < SETTINGS.initialLives; i++) {
            display += (i < lives) ? "❤️" : "🖤"; 
        }
        this.livesText.setText(display);
    }

    showGameOver() {
        this.physics.pause();
        this.add.rectangle(400, 225, 800, 450, 0x000000, 0.7);
        this.add.text(400, 150, 'GAME OVER', { fontSize: '64px', fill: '#f00' }).setOrigin(0.5);
        
        let btnRetry = this.add.text(400, 250, ' RECOMMENCER ', { fontSize: '28px', backgroundColor: '#27ae60' })
            .setPadding(10).setInteractive().setOrigin(0.5);
        btnRetry.on('pointerdown', () => this.scene.restart());

        let btnMenu = this.add.text(400, 330, ' MENU ', { fontSize: '28px', backgroundColor: '#e67e22' })
            .setPadding(10).setInteractive().setOrigin(0.5);
        btnMenu.on('pointerdown', () => window.location.href = 'index.html');
    }

    update() {
        if (isGameOver) return;
        if (typeof updateWorld === 'function') updateWorld(this.gameSpeed);
        [obstacles, coins].forEach(g => {
            g.getChildren().forEach(i => { i.x -= this.gameSpeed; if(i.x < -100) i.destroy(); });
        });
    }
}

gameConfig.scene = MainScene;
new Phaser.Game(gameConfig);