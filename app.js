const mainState = {

  preload: function () {
    game.load.image('ship', 'assets/ship.png');
    game.load.image('enemy', 'assets/enemy.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.spritesheet('explode', 'assets/explode.png', 128, 128);
    game.load.audio('fire', 'assets/fire.mp3');
  },

  create: function () {
    game.stage.backgroundColor = '#88C070';
    //CREATING THE SHIP
    this.ship = game.add.sprite(game.width/2, game.height/2, 'ship');
    game.physics.enable(this.ship, Phaser.Physics.ARCADE);
    this.ship.anchor.set(0.5);
    //PHYSICS SETTINGS FOR SHIP
    game.physics.enable(this.ship, Phaser.Physics.ARCADE);
    this.ship.body.drag.set(100);
    this.ship.body.maxVelocity.set(200);
	shipV = 0;
    //CREATING THE ALIEN GROUP
    this.aliens = game.add.group();
    this.aliens.enableBody = true;
    this.aliens.physicsBodyType = Phaser.Physics.ARCADE;
	alienPos = 0;
    for (let i = 0; i < 1; i++) {
      this.aliens.create(0, game.height, 'enemy');
      this.aliens.create(game.width, 0, 'enemy')
      this.aliens.create(game.width, game.height, 'enemy');
      this.aliens.create(0, 0, 'enemy')
    }
    //CREATING THE BULLET GROUP
    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    //POPULATING THE BULLET GROUP
    for (let i = 0; i < 40; i++) {
      let b = this.bullets.create(0, 0, 'bullet');
      b.exists = false;
      b.visible = false;
      b.checkWorldBounds = true;
      b.events.onOutOfBounds.add((bullet) => { bullet.kill(); });
    }
    this.bulletTime = 0;

    this.explosion = this.game.add.sprite(0, 0, 'explode');
    this.explosion.exists = false;
    this.explosion.visible = false;
    // this.explosion.frame = 6; // show one frame of the spritesheet
    this.explosion.anchor.x = 0.5;
    this.explosion.anchor.y = 0.5;
    this.explosion.animations.add('boom');

    this.highScore = localStorage.getItem('invadershighscore');
    if (this.highScore === null) {
      localStorage.setItem('invadershighscore', 0);
      this.highScore = 0;
    }

    this.score = 0;
    this.scoreDisplay = game.add.text(50, 50, `Score: ${this.score} \nHighScore: ${this.highScore}`, { font: '16px Courier', fill: '#081820' });

    this.fireSound = game.add.audio('fire');

    this.cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
  },

  update: function () {
    game.physics.arcade.overlap(this.bullets, this.aliens, this.hit, null, this);
    game.physics.arcade.overlap(this.aliens, this.ship, this.shipGotHit, null, this);
    this.aliens.forEach(
      (alien) => {
        //Asteroid Movement & Rotation
        alienVelocityY = this.ship.body.position.y - alien.body.position.y;
        alienVelocityX =  this.ship.body.position.x - alien.body.position.x;
		alien.body.rotation += alien.body.velocity.y /100;
        alien.body.velocity.y += alienVelocityY/300;
        alien.body.velocity.x += alienVelocityX/300;
		alien.anchor.x = 0.5;
		alien.anchor.y = 0.5
	  }
    );
	//SHIP MOVEMENT
    this.shipMove();
    this.boundries(this.ship);
    //FIRE GUN
    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
       this.fire(Math.random()/4);
	}
  },

  shipMove: function(){
    if (this.cursors.up.isDown){
	  shipV = 400;
      let  i = game.physics.arcade.accelerationFromRotation(this.ship.rotation, shipV, this.ship.body.acceleration);
    }else{
	  shipV = 0;
      this.ship.body.acceleration.set(shipV);
    }
    if (this.cursors.left.isDown) {
      this.ship.body.angularVelocity = -200;
    } else if (this.cursors.right.isDown) {
      this.ship.body.angularVelocity = 200;
    }else{
      this.ship.body.angularVelocity = 0;
    }
  },

  boundries: function(object){
    //SHIP BOUNDRIES
    if (object.body.position.x < 0){
      object.body.position.x = game.width;
    }else if (object.body.position.x > game.width){
      object.body.position.x = 0;
    }
    if (object.body.position.y < 0){
      object.body.position.y = game.height;
    }else if (object.body.position.y > game.height){
      object.body.position.y = 0;
    }
  },

  fire: function (angle) {
      if (game.time.now > this.bulletTime) {
        game.camera.shake(0.005, 100);
        this.fireSound.play();
		shipV = -200;
		game.physics.arcade.accelerationFromRotation(this.ship.rotation, shipV, this.ship.body.acceleration);
        let bullet = this.bullets.getFirstExists(false);
        if (bullet) {
          bullet.reset(this.ship.x , this.ship.y);
          bullet.rotation = this.ship.rotation;
          game.physics.arcade.velocityFromRotation(this.ship.rotation + angle, 1000, bullet.body.velocity);
          this.bulletTime = game.time.now + 150;
        }
      }
    },
  
  hit: function (bullet, enemy) {
    this.score = this.score + 10;
    bullet.kill();
    enemy.kill();
    game.camera.shake(0.02, 300);
    //Create new enemies
	alienPos = (Math.random() * 800) + 1
    this.aliens.create(alienPos, -50, 'enemy');
    this.aliens.create(alienPos, game.height, 'enemy')
    //Check if game over
    if (this.aliens.countLiving() === 0) {
      this.score = this.score + 100;
      this.gameOver()
    }
    this.scoreDisplay.text = `Score: ${this.score} \nHighScore: ${this.highScore}`;
  },

  shipGotHit: function (alien, ship) {
    this.explosion.reset(this.ship.x + (this.ship.width / 2), this.ship.y + (this.ship.height / 2));
    this.ship.kill();
    this.explosion.animations.play('boom');
    this.gameOver();
  },

  gameOver: function () {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('invadershighscore', this.highScore);
    }
    game.state.start('gameover');
  }
}


const gameoverState = {
  preload: function () {
    game.load.image('gameover', 'assets/gameover.jpg');
  },
  create: function () {
    const gameOverImg = game.cache.getImage('gameover');
    game.add.sprite(
      game.world.centerX - gameOverImg.width / 2,
      game.world.centerY - gameOverImg.height / 2,
      'gameover');
    game.input.onDown.add(() => { game.state.start('main'); });
  }
};

const game = new Phaser.Game(800, 600);
game.state.add('main', mainState);
game.state.add('gameover', gameoverState);
game.state.start('main');
