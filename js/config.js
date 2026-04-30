const SETTINGS = {
    gravity: 1000,
    thrust: -2200,
    startSpeed: 6,
    spawnDelay: 1200
};

let player, background, ground, obstacles, coins;
let isGameOver = false;

const gameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    physics: { default: 'arcade', arcade: { gravity: { y: 0 } } }
};