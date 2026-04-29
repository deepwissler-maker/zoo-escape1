class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.resetVariables();
    }

    resetVariables() {
        this.gameSpeed = 6;
        this.maxSpeed = 18;
        this.score = 0;
        this.coinsCollected = 0;
        this.lives = 3;
        this.isInvincible = false;
        this.hasMagnet = false;
        this.hasShield = false;
        this.scoreMultiplier = 1;
        this.isPaused = false;
        this.isThrusting = false;
    }

    preload() {
        this.load.image('bg', 'https://labs.phaser.io/assets/skies/gradient24.png'); 
        this.load.image('floor', 'https://labs.phaser.io/assets/sprites/platform.png');
        this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('mine', 'https://labs.phaser.io/assets/sprites/wasp.png'); 
        this.load.image('laser', 'https://labs.phaser.io/assets/sprites/longarrow.png');
        this.load.image('smoke', 'https://labs.phaser.io/assets/particles/white-smoke.png');
        this.load.image('coin', 'https://labs.phaser.io/assets/sprites/apple.png');
        this.load.image('powerup', 'https://labs.phaser.io/assets/sprites/orb-blue.png');
        
        // CHARGEMENT DU SON
        this.load.audio('popSound', 'https://labs.phaser.io/assets/audio/SoundEffects/p-ping.mp3');
    }

    create() {
        isGameOver = false;
        this.resetVariables();
        
        // INITIALISATION DU SON
        this.pop = this.sound.add('popSound');

        this.cameras.main.setRoundPixels(false); 
        background = this.add.tileSprite(400, 225, 800, 450, 'bg').setTint(0x2ecc71);
        ground = this.add.tileSprite(400, 435, 800, 40, 'floor').setTint(0x7e5109);
        this.physics.add.existing(ground, true);

        this.emitter = this.add.particles(0, 0, 'smoke', {
            speed: { min: 100, max: 200 },
            angle: { min: 80, max: 100 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 400,
            frequency: 30,
            emitting: false
        });

        player = this.physics.add.sprite(150, 200, 'player');
        player.setGravityY(1000); 
        player.setCollideWorldBounds(true);
        this.physics.add.collider(player, ground);
        this.emitter.startFollow(player, -10, 20);

        this.shieldGraphic = this.add.circle(0, 0, 40, 0x00fbff, 0.3).setVisible(false);

        obstacles = this.physics.add.group();
        this.coins = this.physics.add.group();
        this.powerups = this.physics.add.group();

        this.spawnTimer = this.time.addEvent({ delay: 1200, callback: this.spawnObstacle, callbackScope: this, loop: true });
        this.coinTimer = this.time.addEvent({ delay: 800, callback: this.spawnCoin, callbackScope: this, loop: true });
        this.powerupTimer = this.time.addEvent({ delay: 10000, callback: this.spawnPowerup, callbackScope: this, loop: true });

        this.scoreText = this.add.text(20, 20, 'DISTANCE: 0m', { fontSize: '28px', fill: '#fff', fontStyle: 'bold' });
        this.coinText = this.add.text(20, 55, '🍎: 0', { fontSize: '24px', fill: '#ffcc00' });
        this.livesText = this.add.text(650, 20, '❤️❤️❤️', { fontSize: '28px' });
        this.statusText = this.add.text(400, 100, '', { fontSize: '30px', fill: '#00ffff' }).setOrigin(0.5);

        this.input.on('pointerdown', () => { this.isThrusting = true; });
        this.input.on('pointerup', () => { this.isThrusting = false; });

        this.physics.add.overlap(player, obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(player, this.coins, this.collectCoin, null, this);
        this.physics.add.overlap(player, this.powerups, this.collectPowerup, null, this);
    }

    update() {
        if (!isGameOver && !this.isPaused) {
            if (this.isThrusting) {
                player.setAccelerationY(-2200); 
                this.emitter.emitting = true;
                player.angle = -10;
            } else {
                player.setAccelerationY(0); 
                this.emitter.emitting = false;
                player.angle = 5;
            }

            this.score += 0.15;
            this.scoreText.setText(`DISTANCE: ${Math.floor(this.score)}m`);
            background.tilePositionX += this.gameSpeed * 0.2;
            ground.tilePositionX += this.gameSpeed * 2;
            this.shieldGraphic.setPosition(player.x, player.y).setVisible(this.hasShield);

            if (this.hasMagnet) {
                this.coins.getChildren().forEach(coin => this.physics.moveToObject(coin, player, 600));
            }

            [obstacles, this.coins, this.powerups].forEach(group => {
                group.getChildren().forEach(item => { 
                    item.x -= this.gameSpeed;
                    if (item.x < -100) item.destroy(); 
                });
            });
        }
    }

    spawnObstacle() {
        if (isGameOver || this.isPaused) return;
        let y = Phaser.Math.Between(50, 380);
        let obs = obstacles.create(900, y, Phaser.Math.RND.pick(['laser', 'mine']));
        obs.body.allowGravity = false;
        obs.setTint(0xff0000);
        if (obs.texture.key === 'laser') obs.setScale(0.5).setAngle(Phaser.Math.RND.pick([0, 90]));
    }

    spawnCoin() {
        if (isGameOver || this.isPaused) return;
        this.coins.create(900, Phaser.Math.Between(50, 380), 'coin').setScale(0.8).body.allowGravity = false;
    }

    spawnPowerup() {
        if (isGameOver || this.isPaused) return;
        let p = this.powerups.create(900, Phaser.Math.Between(100, 350), 'powerup');
        p.setData('type', Phaser.Math.Between(0, 2)).body.allowGravity = false;
    }

    collectCoin(p, coin) { 
        coin.destroy(); 
        this.coinsCollected++; 
        this.coinText.setText('🍎: ' + this.coinsCollected); 
        // LECTURE DU SON
        this.pop.play();
    }

    collectPowerup(player, p) {
        let type = p.getData('type');
        p.destroy();
        if (type === 0) { this.hasMagnet = true; this.showMessage("AIMANT !"); this.time.delayedCall(5000, () => this.hasMagnet = false); }
        else if (type === 1) { this.hasShield = true; this.showMessage("BOUCLIER !"); }
        else { this.scoreMultiplier = 2; this.showMessage("SCORE x2 !"); this.time.delayedCall(10000, () => this.scoreMultiplier = 1); }
    }

    hitObstacle(player, obs) {
        if (this.isInvincible) return;
        if (this.hasShield) { this.hasShield = false; obs.destroy(); this.showMessage("BOUCLIER DÉTRUIT !"); return; }
        this.lives--;
        this.updateLivesUI();
        obs.destroy();
        this.cameras.main.shake(200, 0.02);
        
        if (this.lives <= 0) this.gameOver();
        else { 
            this.isInvincible = true; 
            player.setAlpha(0.5); 
            this.time.delayedCall(2000, () => { this.isInvincible = false; player.setAlpha(1); }); 
        }
    }

    showMessage(txt) { this.statusText.setText(txt); this.time.delayedCall(2000, () => this.statusText.setText('')); }
    
    updateLivesUI() { 
        let h = ""; for(let i=0; i<3; i++) h += (i < this.lives) ? "❤️" : "🖤"; 
        this.livesText.setText(h); 
    }

    gameOver() { 
        this.physics.pause(); 
        isGameOver = true; 
        this.emitter.emitting = false;
        this.add.rectangle(400, 225, 800, 450, 0x000000, 0.7);
        this.add.text(400, 180, 'GAME OVER', { fontSize: '60px', fill: '#ff0000', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(400, 250, `Distance: ${Math.floor(this.score)}m`, { fontSize: '28px', fill: '#fff' }).setOrigin(0.5);
        let btnRetry = this.add.text(400, 330, ' REJOUER ', { fontSize: '32px', fill: '#000', backgroundColor: '#0f0' })
            .setPadding(15).setInteractive().setOrigin(0.5);
        btnRetry.on('pointerdown', () => this.scene.restart());
    }
}

gameConfig.scene = MainScene;
const game = new Phaser.Game(gameConfig);