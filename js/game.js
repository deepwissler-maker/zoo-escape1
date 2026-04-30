class MainScene extends Phaser.Scene {
    constructor() { super('MainScene'); }

    preload() {
        // ... (tes chargements d'images habituels)
        this.load.image('bg', 'https://labs.phaser.io/assets/skies/gradient24.png');
        this.load.image('floor', 'https://labs.phaser.io/assets/sprites/platform.png');
        this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('bomb', 'https://labs.phaser.io/assets/sprites/bomb.png');
        this.load.image('laser', 'https://labs.phaser.io/assets/sprites/longarrow.png');
        this.load.image('coin', 'https://labs.phaser.io/assets/sprites/apple.png');
        loadAudio(this);
    }

    create() {
        isGameOver = false;
        lives = SETTINGS.initialLives; // On donne les 3 vies
        this.gameSpeed = SETTINGS.startSpeed;
        
        createWorld(this);
        player = createPlayer(this);
        obstacles = this.physics.add.group();
        coins = this.physics.add.group();

        // Affichage des cœurs en haut à droite
        this.livesText = this.add.text(650, 20, '❤️❤️❤️', { fontSize: '32px' });

        this.time.addEvent({ delay: SETTINGS.spawnDelay, callback: () => spawnObstacle(this), loop: true });
        this.time.addEvent({ delay: 800, callback: () => spawnCoin(this), loop: true });

        this.input.on('pointerdown', () => player.setAccelerationY(SETTINGS.thrust));
        this.input.on('pointerup', () => player.setAccelerationY(0));

        // COLLISION : On utilise la fonction handleHit de obstacles.js
        this.physics.add.overlap(player, obstacles, (p, obs) => handleHit(this, p, obs));
        this.physics.add.overlap(player, coins, (p, c) => { c.destroy(); playPop(this); });
    }

    // Fonction pour mettre à jour le texte des cœurs
    updateLivesUI() {
        let display = "";
        for(let i = 0; i < SETTINGS.initialLives; i++) {
            display += (i < lives) ? "❤️" : "🖤"; // Cœur noir si perdu
        }
        this.livesText.setText(display);
    }

   showGameOver() {
        this.physics.pause();
        isGameOver = true;

        // 1. Fond sombre pour faire ressortir le menu
        this.add.rectangle(400, 225, 800, 450, 0x000000, 0.7);

        // 2. Texte GAME OVER
        this.add.text(400, 150, 'GAME OVER', { 
            fontSize: '64px', 
            fill: '#f00', 
            fontStyle: 'bold' 
        }).setOrigin(0.5);

        // 3. Bouton REJOUER
        let btnRetry = this.add.text(400, 250, ' RECOMMENCER ', { 
            fontSize: '28px', 
            backgroundColor: '#27ae60',
            fill: '#fff'
        }).setPadding(10).setInteractive().setOrigin(0.5);

        btnRetry.on('pointerdown', () => {
            this.scene.restart();
        });

        // 4. Bouton RETOUR AU MENU (La nouveauté)
        let btnMenu = this.add.text(400, 330, ' RETOUR AU MENU ', { 
            fontSize: '28px', 
            backgroundColor: '#e67e22',
            fill: '#fff'
        }).setPadding(10).setInteractive().setOrigin(0.5);

        btnMenu.on('pointerdown', () => {
            // Ici, on redirige vers ta page d'accueil (index.html)
            window.location.href = 'index.html'; 
        });

        // Petit effet au survol des boutons (optionnel mais cool)
        [btnRetry, btnMenu].forEach(btn => {
            btn.on('pointerover', () => btn.setStyle({ fill: '#000' }));
            btn.on('pointerout', () => btn.setStyle({ fill: '#fff' }));
        });
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