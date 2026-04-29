// ==========================================
// 1. CONFIGURATION DES SENSATIONS (TES CHIFFRES)
// ==========================================
const SETTINGS = {
    gravity: 1000,
    thrust: -2200,      // Puissance du jetpack
    startSpeed: 6,
    maxSpeed: 18,
    spawnDelay: 1200,
    invincibilityTime: 2000
};

// ==========================================
// 2. MOTEUR DU JEU (NE PLUS TOUCHER)
// ==========================================
class MainScene extends Phaser.Scene {
    constructor() { super('MainScene'); }

    init() {
        this.gameSpeed = SETTINGS.startSpeed;
        this.score = 0;
        this.coinsCollected = 0;
        this.lives = 3;
        this.isInvincible = false;
        this.hasShield = false;
        this.hasMagnet = false;
        this.isThrusting = false;
    }

    preload() {
        // Chargement complet des assets
        this.load.image('bg', 'https://labs.phaser.io/assets/skies/gradient24.png');
        this.load.image('floor', 'https://labs.phaser.io/assets/sprites/platform.png');
        this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('mine', 'https://labs.phaser.io/assets/sprites/wasp.png');
        this.load.image('laser', 'https://labs.phaser.io/assets/sprites/longarrow.png');
        this.load.image('coin', 'https://labs.phaser.io/assets/sprites/apple.png');
        this.load.image('powerup', 'https://labs.phaser.io/assets/sprites/orb-blue.png');
        this.load.image('smoke', 'https://labs.phaser.io/assets/particles/white-smoke.png');
    }

    create() {
        isGameOver = false;
        
        // Décors et Physique
        background = this.add.tileSprite(400, 225, 800, 450, 'bg').setTint(0x2ecc71);
        ground = this.add.tileSprite(400, 435, 800, 40, 'floor').setTint(0x7e5109);
        this.physics.add.existing(ground, true);

        // Particules (Jetpack)
        this.emitter = this.add.particles(0, 0, 'smoke', {
            speed: { min: 100, max: 200 },
            scale: { start: 0.5, end: 0 },
            lifespan: 400,
            emitting: false
        });

        // Joueur
        player = this.physics.add.sprite(150, 200, 'player');
        player.setGravityY(SETTINGS.gravity).setCollideWorldBounds(true);
        this.physics.add.collider(player, ground);
        this.emitter.startFollow(player, -10, 20);

        // Groupes
        obstacles = this.physics.add.group();
        this.coins = this.physics.add.group();
        this.powerups = this.physics.add.group();

        // Timers
        this.time.addEvent({ delay: SETTINGS.spawnDelay, callback: this.spawnObstacle, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 800, callback: this.spawnCoin, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 10000, callback: this.spawnPowerup, callbackScope: this, loop: true });

        // Interface
        this.scoreText = this.add.text(20, 20, 'DISTANCE: 0m', { fontSize: '28px', fill: '#fff', fontStyle: 'bold' });
        this.livesText = this.add.text(650, 20, '❤️❤️❤️', { fontSize: '28px' });

        // Contrôles
        this.input.on('pointerdown', () => { this.isThrusting = true; });
        this.input.on('pointerup', () => { this.isThrusting = false; });

        // Collisions
        this.physics.add.overlap(player, obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(player, this.coins, this.collectCoin, null, this);
        this.physics.add.overlap(player, this.powerups, this.collectPowerup, null, this);
    }

    update() {
        if (isGameOver) return;

        // Gestion du Jetpack (La fluidité)
        if (this.isThrusting) {
            player.setAccelerationY(SETTINGS.thrust);
            this.emitter.emitting = true;
            player.angle = -10;
        } else {
            player.setAccelerationY(0);
            this.emitter.emitting = false;
            player.angle = 5;
        }

        // Vitesse progressive
        if (this.gameSpeed < SETTINGS.maxSpeed) this.gameSpeed += 0.001;

        background.tilePositionX += this.gameSpeed * 0.2;
        ground.tilePositionX += this.gameSpeed * 2;
        this.score += 0.1;
        this.scoreText.setText(`DISTANCE: ${Math.floor(this.score)}m`);

        // Magnétisme (Si power-up actif)
        if (this.hasMagnet) {
            this.coins.getChildren().forEach(c => this.physics.moveToObject(c, player, 600));
        }

        // Nettoyage objets hors-écran
        [obstacles, this.coins, this.powerups].forEach(g => {
            g.getChildren().forEach(i => { i.x -= this.gameSpeed; if(i.x < -100) i.destroy(); });
        });
    }

    // ==========================================
    // 3. FONCTIONS SPÉCIFIQUES (TES LASERS ET BONUS)
    // ==========================================
    spawnObstacle() {
        let y = Phaser.Math.Between(50, 380);
        let type = Phaser.Math.RND.pick(['laser', 'mine']);
        let obs = obstacles.create(900, y, type);
        obs.body.allowGravity = false;
        if(type === 'laser') obs.setScale(0.5).setAngle(Phaser.Math.RND.pick([0, 45, 90]));
    }

    collectCoin(p, c) { c.destroy(); this.coinsCollected++; }

    collectPowerup(p, pu) {
        pu.destroy();
        this.hasMagnet = true;
        this.time.delayedCall(5000, () => this.hasMagnet = false);
    }

    hitObstacle(p, obs) {
        if (this.isInvincible) return;
        this.lives--;
        this.updateLivesUI();
        obs.destroy();
        if (this.lives <= 0) this.showGameOver();
        else {
            this.isInvincible = true;
            p.setAlpha(0.5);
            this.time.delayedCall(SETTINGS.invincibilityTime, () => { this.isInvincible = false; p.setAlpha(1); });
        }
    }

    updateLivesUI() {
        let h = ""; for(let i=0; i<3; i++) h += (i < this.lives) ? "❤️" : "🖤";
        this.livesText.setText(h);
    }

    showGameOver() {
        isGameOver = true;
        this.physics.pause();
        this.emitter.emitting = false;
        
        // Ecran de fin
        let rect = this.add.rectangle(400, 225, 800, 450, 0x000000, 0.8);
        this.add.text(400, 150, 'ZOO OVER', { fontSize: '60px', fill: '#0f0' }).setOrigin(0.5);
        
        // Bouton Recommencer
        let btnRetry = this.add.text(400, 250, 'REESSAYER', { fontSize: '32px', backgroundColor: '#27ae60' })
            .setPadding(10).setInteractive().setOrigin(0.5);
        btnRetry.on('pointerdown', () => this.scene.restart());

        // Bouton Menu
        let btnMenu = this.add.text(400, 320, 'MENU PRINCIPAL', { fontSize: '24px', backgroundColor: '#e67e22' })
            .setPadding(10).setInteractive().setOrigin(0.5);
        btnMenu.on('pointerdown', () => window.location.href = 'index.html');
    }
}

gameConfig.scene = MainScene;
new Phaser.Game(gameConfig);