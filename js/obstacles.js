function spawnObstacle(scene) {
    if (isGameOver) return;
    
    let y = Phaser.Math.Between(50, 380);
    let type = Phaser.Math.RND.pick(['laser', 'bomb']); // ON UTILISE BOMB
    let obs = obstacles.create(900, y, type);
    
    obs.body.allowGravity = false;
    
    if (type === 'laser') {
        obs.setScale(0.6).setTint(0xff0055); // Rose/Rouge flash
        obs.setAngle(Phaser.Math.RND.pick([0, 90]));
    } else {
        obs.setScale(1).setTint(0x333333); // Bombe noire
        // Effet clignotant rouge pour la bombe
        scene.tweens.add({
            targets: obs,
            tint: 0xff0000,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }
}

function handleHit(scene, player, obstacle) {
    if (scene.isInvincible) return;

    lives--;
    obstacle.destroy();
    scene.updateLivesUI();

    if (lives <= 0) {
        isGameOver = true;
        scene.showGameOver();
    } else {
        scene.isInvincible = true;
        player.setAlpha(0.5);
        scene.time.delayedCall(1500, () => {
            scene.isInvincible = false;
            player.setAlpha(1);
        });
    }
}