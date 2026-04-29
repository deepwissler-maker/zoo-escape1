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
        initAudio(this);

        background = this.add.tileSprite(400, 225, 800, 450, 'bg').setTint(0x2ecc71);
        ground = this.add.tileSprite(400, 435, 800, 40, 'floor').setTint(0x7e5109);
        this.physics.add.existing(ground, true);

        player = this.physics.add.sprite(150, 200, 'player');
        player.setGravityY(SETTINGS.gravity).setCollideWorldBounds(true);
        this.physics.add.collider(player, ground);

        obstacles = this.physics.add.group();
        this.coins = this.physics.add.group();

        this.time.addEvent({ delay: SETTINGS.spawnDelay, callback: () => spawnObstacle(this), loop: true });
        this.time.addEvent({ delay: 800, callback: () => spawnCoin(this), loop: true });

        this.input.on('pointerdown', () => { player.setAccelerationY(SETTINGS.thrust); });
        this.input.on('pointerup', () => { player.setAccelerationY(0); });
        
        this.physics.add.overlap(player, obstacles, () => { this.scene.restart(); }, null, this);
        this.physics.add.overlap(player, this.coins, (p, c) => { c.destroy(); playPop(this); }, null, this);
    }

    update() {
        if (isGameOver) return;
        background.tilePositionX += this.gameSpeed * 0.2;
        ground.tilePositionX += this.gameSpeed * 2;
        [obstacles, this.coins].forEach(g => {
            g.getChildren().forEach(i => { i.x -= this.gameSpeed; if(i.x < -100) i.destroy(); });
        });
    }
}

gameConfig.scene = MainScene;
new Phaser.Game(gameConfig);