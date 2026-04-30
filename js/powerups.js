function spawnCoin(scene) {
    if (isGameOver) return;
    let c = coins.create(900, Phaser.Math.Between(50, 380), 'coin');
    c.setScale(0.8).body.allowGravity = false;
}