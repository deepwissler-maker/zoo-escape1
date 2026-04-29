// Variables de sauvegarde
var totalCoins = parseInt(localStorage.getItem('zooCoins')) || 0;
var selectedCharacter = localStorage.getItem('selectedChar') || 'Lion';
var ownedCharacters = JSON.parse(localStorage.getItem('ownedChars')) || ['Lion'];
var isGameOver = false;

// Variables globales pour Phaser
var player, background, ground, obstacles;

const gameConfig = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 450
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    }
};