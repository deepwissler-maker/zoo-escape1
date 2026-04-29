function loadAudio(scene) {
    scene.load.audio('popSound', 'https://labs.phaser.io/assets/audio/SoundEffects/p-ping.mp3');
}

function initAudio(scene) {
    scene.pop = scene.sound.add('popSound');
}

function playPop(scene) {
    if(scene.pop) scene.pop.play();
}