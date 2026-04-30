function loadAudio(scene) {
    scene.load.audio('popSound', 'https://labs.phaser.io/assets/audio/SoundEffects/p-ping.mp3');
}

function playPop(scene) {
    scene.sound.play('popSound');
}