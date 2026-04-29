// ==========================================
// 1. TES RÉGLAGES (MODIFIE ICI UNIQUEMENT)
// ==========================================
const SETTINGS = {
    gravity: 800,        // Puissance qui tire vers le bas
    jumpForce: -350,     // Puissance du saut (plus c'est haut, plus il saute)
    startSpeed: 5,       // Vitesse du sol au début
    maxSpeed: 15,        // Vitesse maximum
    spawnDelay: 1400,    // Temps entre chaque obstacle (en millisecondes)
};

// ==========================================
// 2. LOGIQUE TECHNIQUE (NE PAS TOUCHER)
// ==========================================
class MainScene extends Phaser.Scene {
    constructor() { super('MainScene'); }

    init() {
        // On remet les variables à zéro au début
        this.gameSpeed = SETTINGS.startSpeed;
        this.score = 0;
        this.lives = 3;
        this.isInvincible = false;
        this.isJumping = false;
    }

    preload() {
        // Chargement des images (URLs inchangées pour éviter les bugs)
        this.load.image('bg', 'https://labs.phaser.io/assets/skies/gradient24.png');
        this.load.image('floor', 'https://labs.phaser.io/assets/sprites/platform.png');
        this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('mine', 'https://labs.phaser.io/assets/sprites/wasp.png');
        this.load.image('laser', 'https://labs.phaser.io/assets/sprites/longarrow.png');
        this.load.image('coin', 'https://labs.phaser.io/assets/sprites/apple.png');
    }

    create() {
        isGameOver = false;
        
        // Création du décor
        background = this.add.tileSprite(400, 225, 800, 450, 'bg').setTint(0x2ecc71);
        ground = this.add.tileSprite(400, 435, 800, 40, 'floor').setTint(0x7e5109);
        this.physics.add.existing(ground, true);

        // Création du joueur avec TES réglages
        player = this.physics.add.sprite(150, 200, 'player');
        player.setGravityY(SETTINGS.gravity);
        player.setCollideWorldBounds(true);
        this.physics.add.collider(player, ground);

        // Groupes d'objets
        obstacles = this.physics.add.group();
        this.coins = this.physics.add.group();

        // Timers (utilisent les SETTINGS du haut)
        this.time.addEvent({ delay: SETTINGS.spawnDelay, callback: this.spawnObstacle, callbackScope: this, loop: true });
        
        // UI (Texte)
        this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '24px', fill: '#fff' });
        this.livesText = this.add.text(650, 20, '❤️❤️❤️', { fontSize: '24px' });

        // Contrôles
        this.input.on('pointerdown', () => { this.jump(); });
    }

    // ==========================================
    // 3. LES ACTIONS DU JEU
    // ==========================================

    jump() {
        if (isGameOver) return;
        player.setVelocityY(SETTINGS.jumpForce); // Utilise ta force de saut
    }

    update() {
        if (isGameOver) return;

        // Défilement du décor
        background.tilePositionX += this.gameSpeed * 0.2;
        ground.tilePositionX += this.gameSpeed;

        // Score
        this.score += 0.1;
        this.scoreText.setText('Score: ' + Math.floor(this.score));

        // Mouvement des obstacles
        [obstacles, this.coins].forEach(group => {
            group.getChildren().forEach(item => {
                item.x -= this.gameSpeed;
                if (item.x < -100) item.destroy();
            });
        });

        // Collision
        this.physics.add.overlap(player, obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(player, this.coins, (p, c) => { c.destroy(); }, null, this);
    }

    spawnObstacle() {
        let y = Phaser.Math.Between(50, 380);
        let obs = obstacles.create(900, y, 'mine').setScale(0.8);
        obs.body.allowGravity = false;
    }

    hitObstacle(p, obs) {
        if (this.isInvincible) return;
        this.lives--;
        obs.destroy();
        if (this.lives <= 0) this.gameOver();
        else {
            this.isInvincible = true;
            p.setAlpha(0.5);
            this.time.delayedCall(1500, () => { this.isInvincible = false; p.setAlpha(1); });
        }
    }

    gameOver() {
        this.physics.pause();
        isGameOver = true;
        this.add.text(400, 225, 'GAME OVER', { fontSize: '64px', fill: '#f00' }).setOrigin(0.5);
    }
}

gameConfig.scene = MainScene;
new Phaser.Game(gameConfig);