class MainScene extends Phaser.Scene {
    constructor() { super('MainScene'); }

    preload() {
        this.load.image('bg', 'https://labs.phaser.io/assets/skies/gradient24.png');
        this.load.image('floor', 'https://labs.phaser.io/assets/sprites/platform.png');
        this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('mine', 'https://labs.phaser.io/assets/sprites/wasp.png');
        this.load.image('laser', 'https://labs.phaser.io/assets/sprites/longarrow.png');
        this.load.image('coin', 'https://labs.phaser.io/assets/sprites/apple.png');
        loadAudio(this);
    }

    create() {
        isGameOver = false;
        this.gameSpeed = SETTINGS.startSpeed;
        createWorld(this);
        player = createPlayer(this);
        obstacles = this.physics.add.group();
        coins = this.physics.add.group();

        this.time.addEvent({ delay: SETTINGS.spawnDelay, callback: () => spawnObstacle(this), loop: true });
        this.time.addEvent({ delay: 800, callback: () => spawnCoin(this), loop: true });

        this.input.on('pointerdown', () => player.setAccelerationY(SETTINGS.thrust));
        this.input.on('pointerup', () => player.setAccelerationY(0));

        this.physics.add.overlap(player, obstacles, () => { isGameOver = true; this.scene.restart(); });
        this.physics.add.overlap(player, coins, (p, c) => { c.destroy(); playPop(this); });
    }

    update() {
        if (isGameOver) return;
        updateWorld(this.gameSpeed);
        [obstacles, coins].forEach(g => {
            g.getChildren().forEach(i => { i.x -= this.gameSpeed; if(i.x < -100) i.destroy(); });
        });
    }
}

gameConfig.scene = MainScene;
new Phaser.Game(gameConfig);