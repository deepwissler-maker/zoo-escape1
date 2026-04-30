function createPlayer(scene) {
    let p = scene.physics.add.sprite(150, 200, 'player');
    p.setGravityY(SETTINGS.gravity).setCollideWorldBounds(true);
    scene.physics.add.collider(p, ground);
    return p;
}