function createWorld(scene) {
    background = scene.add.tileSprite(400, 225, 800, 450, 'bg').setTint(0x2ecc71);
    ground = scene.add.tileSprite(400, 435, 800, 40, 'floor').setTint(0x7e5109);
    scene.physics.add.existing(ground, true);
}

function updateWorld(speed) {
    background.tilePositionX += speed * 0.2;
    ground.tilePositionX += speed * 2;
}