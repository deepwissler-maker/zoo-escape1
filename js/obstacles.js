function spawnObstacle(scene) {
    if (isGameOver) return;
    let y = Phaser.Math.Between(50, 380);
    let type = Phaser.Math.RND.pick(['laser', 'mine']);
    let obs = obstacles.create(900, y, type);
    obs.body.allowGravity = false;
    if(type === 'laser') obs.setScale(0.5).setAngle(Phaser.Math.RND.pick([0, 45, 90]));
}

function spawnCoin(scene) {
    if (isGameOver) return;
    scene.coins.create(900, Phaser.Math.Between(50, 380), 'coin').setScale(0.8).body.allowGravity = false;
}

function handleHit(scene, player, obstacle) {
    // Si le joueur est déjà en train de clignoter (invincible), on ne fait rien
    if (scene.isInvincible) return;

    lives--; // On enlève un cœur
    obstacle.destroy(); // On détruit l'obstacle touché
    
    // Mise à jour de l'affichage des cœurs
    scene.updateLivesUI();

    if (lives <= 0) {
        isGameOver = true;
        scene.showGameOver();
    } else {
        // Petit moment d'invincibilité pour ne pas tout perdre d'un coup
        scene.isInvincible = true;
        player.setAlpha(0.5); // Le perso devient transparent
        scene.time.delayedCall(1500, () => {
            scene.isInvincible = false;
            player.setAlpha(1);
        });
    }
}