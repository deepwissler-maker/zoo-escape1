function createPlayer(scene) {
    let p = scene.physics.add.sprite(150, 200, 'player');
    p.setGravityY(SETTINGS.gravity).setCollideWorldBounds(true);
    // On vérifie que ground existe avant de mettre la collision
    if (ground) scene.physics.add.collider(p, ground);
    return p;
}