class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.resetVariables();
    }

    resetVariables() {
        this.gameSpeed = 5;
        this.maxSpeed = 15;
        this.score = 0;
        this.coinsCollected = 0;
        this.lives = 3;
        this.isInvincible = false;
        this.hasMagnet = false;
        this.hasShield = false;
        this.scoreMultiplier = 1;
        this.isPaused = false;
        this.isJumping = false;
    }

    preload() {
        this.load.image('bg', 'https://labs.phaser.io/assets/skies/space3.png');
        this.load.image('floor', 'https://labs.phaser.io/assets/sprites/platform.png');
        this.load.image('Lion', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('Singe', 'https://labs.phaser.io/assets/sprites/orange-cat1.png');
        this.load.image('Elephant', 'https://labs.phaser.io/assets/sprites/bsquadron1.png');
        this.load.image('mine', 'https://labs.phaser.io/assets/sprites/mine.png');
        this.load.image('laser', 'https://labs.phaser.io/assets/sprites/longarrow.png');
        this.load.image('particle', 'https://labs.phaser.io/assets/particles/yellow.png');
        this.load.image('coin', 'https://labs.phaser.io/assets/sprites/apple.png');
        this.load.image('powerup', 'https://labs.phaser.io/assets/sprites/orb-blue.png');
    }

    create() {
        isGameOver = false;
        this.resetVariables();

        background = this.add.tileSprite(400, 225, 800, 450, 'bg');
        ground = this.add.tileSprite(400, 425, 800, 50, 'floor');
        this.physics.add.existing(ground, true);

        this.emitter = this.add.particles(0, 0, 'particle', {
            speed: 100, scale: { start: 0.4, end: 0 },
            blendMode: 'ADD', lifespan: 300, emitting: false
        });

        player = this.physics.add.sprite(100, 200, selectedCharacter);
        player.setCollideWorldBounds(true);
        this.physics.add.collider(player, ground);
        this.emitter.startFollow(player, 0, 20);

        this.shieldGraphic = this.add.circle(0, 0, 40, 0x00fbff, 0.3).setVisible(false);

        obstacles = this.physics.add.group();
        this.coins = this.physics.add.group();
        this.powerups = this.physics.add.group();

        // Apparition des obstacles et bonus
        this.spawnTimer = this.time.addEvent({ delay: 1400, callback: this.spawnObstacle, callbackScope: this, loop: true });
        this.coinTimer = this.time.addEvent({ delay: 800, callback: this.spawnCoin, callbackScope: this, loop: true });
        
        // Power-ups plus rares et mieux placés (entre 8 et 15 secondes)
        this.powerupTimer = this.time.addEvent({ 
            delay: Phaser.Math.Between(8000, 15000), 
            callback: this.spawnPowerup, 
            callbackScope: this, 
            loop: true 
        });
        
        this.speedTimer = this.time.addEvent({
            delay: 5000, 
            callback: () => {
                if (this.gameSpeed < this.maxSpeed) {
                    this.gameSpeed += 0.5;
                    this.showMessage("VITESSE AUGMENTE !");
                }
            },
            loop: true
        });

        this.scoreText = this.add.text(620, 20, 'Score: 0', { fontSize: '24px', fill: '#fff' });
        this.coinText = this.add.text(620, 50, 'Pièces: 0', { fontSize: '24px', fill: '#ffcc00' });
        this.livesText = this.add.text(20, 60, 'Vies: ❤️❤️❤️', { fontSize: '24px', fill: '#ff0000' });
        this.statusText = this.add.text(400, 40, '', { fontSize: '20px', fill: '#00ffff' }).setOrigin(0.5);
        
        this.pauseBtn = this.add.text(20, 20, ' PAUSE ', { fontSize: '24px', fill: '#000', backgroundColor: '#fff' })
            .setPadding(5).setInteractive().on('pointerdown', () => this.togglePause());

        this.physics.add.overlap(player, obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(player, this.coins, this.collectCoin, null, this);
        this.physics.add.overlap(player, this.powerups, this.collectPowerup, null, this);

        this.input.on('pointerdown', (p) => {
            if (p.x < 120 && p.y < 70 || this.isPaused || isGameOver) return;
            this.isJumping = true;
            this.emitter.emitting = true;
        });

        this.input.on('pointerup', () => {
            this.isJumping = false;
            this.emitter.emitting = false;
        });
    }

    update() {
        if (!isGameOver && !this.isPaused) {
            if (this.isJumping) {
                player.setVelocityY(-300);
                player.angle = -15;
            } else {
                player.angle = 5;
            }

            this.score += (this.gameSpeed / 10) * this.scoreMultiplier;
            this.scoreText.setText('Score: ' + Math.floor(this.score));

            background.tilePositionX += this.gameSpeed * 0.2;
            ground.tilePositionX += this.gameSpeed;

            this.shieldGraphic.setPosition(player.x, player.y).setVisible(this.hasShield);

            if (this.hasMagnet) {
                this.coins.getChildren().forEach(coin => this.physics.moveToObject(coin, player, 600));
            }

            [obstacles, this.coins, this.powerups].forEach(group => {
                group.getChildren().forEach(item => { 
                    item.setVelocityX(-(this.gameSpeed * 80));
                    if (item.x < -150) item.destroy(); 
                });
            });
        }
    }

    spawnObstacle() {
        if (isGameOver || this.isPaused) return;
        let type = Phaser.Math.Between(0, 3); 
        let obs;
        
        if (type === 0) { // Laser Horizontal court
            obs = obstacles.create(850, Phaser.Math.Between(100, 300), 'laser');
            obs.setScale(0.4, 0.4);
        } else if (type === 1) { // Mine
            obs = obstacles.create(850, Phaser.Math.Between(50, 350), 'mine').setScale(0.7);
        } else if (type === 2) { // Laser Vertical (Mur)
            obs = obstacles.create(850, Phaser.Math.Between(100, 300), 'laser');
            obs.setScale(0.4, 0.4).setAngle(90);
        } else { // Laser Diagonal ou Barrière Rouge corrigée
            obs = obstacles.create(850, 390, 'laser').setScale(0.5, 0.6).setAngle(90).setTint(0xff0000);
        }

        obs.body.allowGravity = false;
        // Correction collision : La zone de hit correspond maintenant à l'image
        obs.body.setSize(obs.width * 0.8, obs.height * 0.8);
    }

    spawnCoin() {
        if (isGameOver || this.isPaused) return;
        this.coins.create(850, Phaser.Math.Between(50, 380), 'coin').setScale(0.8).body.allowGravity = false;
    }

    spawnPowerup() {
        if (isGameOver || this.isPaused) return;
        let type = Phaser.Math.Between(0, 2);
        // Apparition à une hauteur aléatoire pour forcer le mouvement
        let p = this.powerups.create(850, Phaser.Math.Between(100, 350), 'powerup');
        p.setData('type', type).body.allowGravity = false;
        p.setTint([0xffff00, 0x00ffff, 0xff00ff][type]);
    }

    collectCoin(p, coin) { coin.destroy(); this.coinsCollected++; this.coinText.setText('Pièces: ' + this.coinsCollected); }

    collectPowerup(player, p) {
        let type = p.getData('type');
        p.destroy();
        if (type === 0) { this.hasMagnet = true; this.showMessage("AIMANT !"); this.time.delayedCall(5000, () => this.hasMagnet = false); }
        else if (type === 1) { this.hasShield = true; this.showMessage("BOUCLIER !"); }
        else { this.scoreMultiplier = 2; this.scoreText.setTint(0xff00ff); this.showMessage("SCORE x2 !"); this.time.delayedCall(10000, () => { this.scoreMultiplier = 1; this.scoreText.clearTint(); }); }
    }

    hitObstacle(player, obs) {
        if (this.isInvincible) return;
        if (this.hasShield) { this.hasShield = false; obs.destroy(); this.showMessage("BOUCLIER DÉTRUIT !"); return; }
        this.lives--; this.updateLivesUI(); obs.destroy();
        if (this.lives <= 0) this.gameOver();
        else { this.isInvincible = true; player.setAlpha(0.5); this.time.delayedCall(2000, () => { this.isInvincible = false; player.setAlpha(1); }); }
    }

    showMessage(txt) { this.statusText.setText(txt); this.time.delayedCall(2000, () => { if(this.statusText.text === txt) this.statusText.setText(''); }); }
    updateLivesUI() { let h = ""; for(let i=0; i<3; i++) h += (i < this.lives) ? "❤️" : "🖤"; this.livesText.setText('Vies: ' + h); }
    togglePause() { this.isPaused = !this.isPaused; this.physics.world.paused = this.isPaused; this.pauseBtn.setText(this.isPaused ? ' REPRENDRE ' : ' PAUSE '); }
    
    gameOver() { 
        this.physics.pause(); 
        isGameOver = true; 
        this.isJumping = false;
        this.emitter.emitting = false;
        totalCoins += this.coinsCollected;
        localStorage.setItem('zooCoins', totalCoins);
        
        // Panneau Game Over
        let panel = this.add.rectangle(400, 225, 450, 250, 0x000000, 0.9).setOrigin(0.5);
        this.add.text(400, 160, 'GAME OVER', { fontSize: '40px', fill: '#ff0000', fontWeight: 'bold' }).setOrigin(0.5);
        this.add.text(400, 210, `Score final: ${Math.floor(this.score)}`, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

        // Bouton REJOUER
        let btnRetry = this.add.text(400, 270, ' REJOUER ', { fontSize: '24px', fill: '#000', backgroundColor: '#0f0' })
            .setPadding(10).setInteractive().setOrigin(0.5);
        btnRetry.on('pointerdown', () => this.scene.restart());

        // Bouton ACCUEIL
        let btnHome = this.add.text(400, 320, ' MENU ACCUEIL ', { fontSize: '20px', fill: '#fff', backgroundColor: '#333' })
            .setPadding(8).setInteractive().setOrigin(0.5);
        btnHome.on('pointerdown', () => window.location.href = 'index.html');
    }
}

gameConfig.scene = MainScene;
const game = new Phaser.Game(gameConfig);