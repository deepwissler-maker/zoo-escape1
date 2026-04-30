// js/obstacles.js

function spawnObstacle(scene) {
    if (isGameOver) return;
    
    let y = Phaser.Math.Between(50, 380);
    let type = Phaser.Math.RND.pick(['laser', 'bomb']); // On utilise 'bomb' maintenant
    let obs = obstacles.create(900, y, type);
    
    obs.body.allowGravity = false;
    
    if (type === 'laser') {
        // LASER : Rouge vif ou Rose néon pour trancher avec le vert
        obs.setScale(0.6);
        obs.setTint(0xff0055); // Un rouge-rose très voyant
        
        // On lui donne un petit effet de scintillement pour qu'il ait l'air "électrique"
        scene.tweens.add({
            targets: obs,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: -1
        });
        
        obs.setAngle(Phaser.Math.RND.pick([0, 90]));
    } 
    else {
        // BOMBE : On la met en noir/gris avec un éclat rouge
        obs.setScale(1.2);
        obs.setTint(0x333333); // Corps de la bombe noir
        
        // Effet de clignotement "Alerte" (la bombe va exploser !)
        scene.tweens.add({
            targets: obs,
            tint: 0xff0000,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }
}

// Garde ta fonction handleHit en dessous sans la changer