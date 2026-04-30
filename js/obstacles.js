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