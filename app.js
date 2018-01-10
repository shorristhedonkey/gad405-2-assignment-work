const mainState = {
//Opening the preload function and loading in all the assets that will be used in the game from the source files in the assets folder
  preload: function () {
    game.load.image('ship', 'assets/ship.png');
    game.load.image('enemy', 'assets/enemy.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.spritesheet('explode', 'assets/explode.png', 128, 128);
    game.load.audio('fire', 'assets/fire.mp3');
	game.load.audio('boom', 'assets/boom.mp3');
	game.load.audio('lose', 'assets/Explosion.mp3');
	game.load.image('star', 'assets/star.png');
	game.load.image('title', 'assets/title.png');	
  },
//Closing the preload function ----

//Opening the create function to set things up that need to be ready for when the game starts  
  create: function () {
	//SETTING THE WORLD BOUNDRIES
	game.world.setBounds(0, 0, 1034, 610);
	//ALLIGNING THE WINDOW TO CENTER OF THE WEB PAGE
	game.scale.pageAlignHorizontally = true;
	game.scale.pageAlignVertically = true; 	
	//SETTING UP THE BACKGROUND
	game.stage.backgroundColor = '#081820';
	//CREATING THE STARFIELD
	for(let x = 0; x < 100; x ++){ //creating a loop that will run 100 times
		game.add.sprite(Math.random() * game.width, Math.random() * game.height, "star"); //importing the star sprite and placing it in a random position on the screen
	} //Closing the Loop and continuing
	//CREATING THE TITLE
    const title = game.cache.getImage('title'); //Getting the image "title" imported in the preload function and saving it as a variable
	game.add.sprite(game.world.centerX - title.width / 2, game.world.centerY - title.height / 2, 'title'); //Display the image at the center of the screen 
    //CREATING THE SHIP
    this.ship = game.add.sprite(game.width/2, game.height/2, 'ship'); //Creating an object called "this.ship" using the "ship" sprite imported earlier
    this.ship.anchor.set(0.5); //Setting the ships anchor to the center of the ship (used for rotations)
    //PHYSICS SETTINGS FOR SHIP
    game.physics.enable(this.ship, Phaser.Physics.ARCADE); //Giving the object a Physics body (used for collisions)
    this.ship.body.drag.set(100); //Setting the value of Drag for the ship
    this.ship.body.maxVelocity.set(200); //setting the maximum possible velocity on the ship
	shipV = 0; //Creating a variable called "shipV" with a value of zero, used later to store the velocity of the ship
    //CREATING THE ALIEN GROUP
    this.aliens = game.add.group();
    this.aliens.enableBody = true; //enabling a body for the aliens in the group (used for physics and collisions)
    this.aliens.physicsBodyType = Phaser.Physics.ARCADE; //setting the physics type to be "ARCADE" for the aliens
	alienPos = 0; //creating a variable "alienPos" with a value of 0, will be used later as the spawn point for new aliens along the Y axis
	  this.aliens.create(0, game.height, 'enemy'); //creating an alien/asteroid in the bottom left corner of the screen
      this.aliens.create(game.width, 0, 'enemy'); //creating an alien/asteroid in the top right corner of the screen
      this.aliens.create(game.width, game.height, 'enemy'); //creating an alien/asteroid in the bottom right corner of the screen
      this.aliens.create(0, 0, 'enemy'); //creating an alien/asteroid in the top left corner of the screen
    //CREATING THE BULLET GROUP
    this.bullets = game.add.group(); //Creating the bullet group
    this.bullets.enableBody = true; //enabling a body for collisions in the bullets group
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE; //setting the physics engine type to be ARCADE for the bullets
    //POPULATING THE BULLET GROUP
    for (let i = 0; i < 40; i++) { //creating a loop that will run 40 times
      let b = this.bullets.create(0, 0, 'bullet'); //add a bullet to the bullet group in the top left hand corner of the screen
      b.exists = false; //make the bullet created not show up or be calculated on screen so it can be spawned later
      b.visible = false; //make the bullet invisible
      b.checkWorldBounds = true; //check if the bullet goes off screen
      b.events.onOutOfBounds.add((bullet) => { bullet.kill(); }); //if the bullet goes off screen, delete it
    }
    this.bulletTime = 0; //creating a vaiable called "bulletTime" with a value of 0, will be used later

    this.explosion = this.game.add.sprite(0, 0, 'explode'); //creating the explosion object 
    this.explosion.exists = false; //store the explosion object, dont display it 
    this.explosion.visible = false; //make the explosion invisible
    // this.explosion.frame = 6; // show one frame of the spritesheet
    this.explosion.anchor.x = 0.5; //set the anchor on the x axis to be the center of the explosion
    this.explosion.anchor.y = 0.5; //set the anchors y axis to be at the center of the explosion
    this.explosion.animations.add('boom'); //add the animation "boom" for the explosion to play through its sprite sheet

    this.highScore = localStorage.getItem('invadershighscore'); //create a variable called "high score" and store it in the players browser storage
    if (this.highScore === null) { //if high score doesnt have a value yet (the player has never played the game before)
      localStorage.setItem('invadershighscore', 0); //create an item in the players browser storage called "invadershighscore"
      this.highScore = 0; //set the high score to 0
    } //end the if statement
    this.score = 0; //create a variable called "this.score" and set the value to 0
    this.scoreDisplay = game.add.text(50, 50, `Score: ${this.score} \nHighScore: ${this.highScore}`, { font: '16px Courier', fill: '#88C070' }); 
	//create some text on the screen that is 50 pixels accross and 50 pixels down from the top corner and 50 pixels accross, make it display the word "score" along with the value of
	//the variable "this.score", then display the word "high score" along with the value of the variable "this.highScore" which is read from the browser data

    this.fireSound = game.add.audio('fire'); //creating a variable called "fireSound" which stores the sound effect "fire" from the game file
	this.boom = game.add.audio('boom'); //creating a variable called "boom" which stores the sound effect "boom" from the game file
	this.lose = game.add.audio('lose'); //creating a variable called "lose" which stores the sound effect "lose" from the game file
	//SETTING UP THE CAMERA 
	game.camera.follow(this.ship, Phaser.Camera.Follow_LOCKON, 1, 1); //set the camera to follow the ship objects position with a small amount of interpolation for smooth movement
	//SETTING UP THE INPUT METHODS
    this.cursors = game.input.keyboard.createCursorKeys(); //save the cursor key inputs as a variable "this.cursors"
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]); //add the space bar to the possible inputs the game can read
  }, //end the create function

  update: function () { //declare the update function that runs every frame
	game.physics.arcade.overlap(this.bullets, this.aliens, this.hit, null, this); //create an event for when the bullets collide with the aliens/asteroids
    game.physics.arcade.overlap(this.aliens, this.ship, this.shipGotHit, null, this); //create an event for when the aliens/asteroid collide with the ship
    this.aliens.forEach( //do this for each individual alien/asteroid
      (alien) => { //individual aliens/asteroids are called "alien"
        //Asteroid Movement & Rotation
        alienVelocityY = this.ship.body.position.y - alien.body.position.y; 
		//create a variable called "alienvelocityY" and take the Y position of the alien away from the Y position of the ship
        alienVelocityX =  this.ship.body.position.x - alien.body.position.x;
		//do the same for the X axis
		alien.body.rotation += alien.body.velocity.y /100;
		//set the rotation of the alien to be equal to the velocity on the Y axis/100 (making it spin faster depending on how fast its moving)
        alien.body.velocity.y += alienVelocityY/300; //set the Y velocity of the alien/asteroid to be equal to the variable "alienVelocityY" and divide the value by 300 to slow them down
        alien.body.velocity.x += alienVelocityX/300; //do the same for the X axis
		alien.anchor.x = 0.5; //set the x axis anchor of the alien/asteroid to be in the center
		alien.anchor.y = 0.5 //do the same for the y axis anchor
		}
    );
	//SHIP MOVEMENT
    this.shipMove(); //call the function "this.shipMove()"
    this.boundries(this.ship); //call the function "boundries" and import the ship object into it
    //FIRE GUN
    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) { //if the button "SPACEBAR" is pressed
       this.fire(Math.random()/4 - 0.2); //call the fire function and pass it a random number between 0 and 1, then divide that by 4 and - 0.2 (for bullet spread)
	}
  }, //end the update function

  shipMove: function(){ //declare the shipMove function
    if (this.cursors.up.isDown){ //if the up arrow is pressed down on the keyboard
	  shipV = 400; //set the value of "shipV" to equal 400
      game.physics.arcade.accelerationFromRotation(this.ship.rotation, shipV, this.ship.body.acceleration); 
	  //accelerate in direction that the ship is facing with the value of "shipV" and set the acceleration of the ship
    }else{ //else
	  shipV = 0; //set "shipV" to 0
      this.ship.body.acceleration.set(shipV); //set the acceleration to the value of "shipV"
		//this.ship.body.acceleration.y = 400; //set the acceleration to 400 in the y direction, adds gravity to the ship
    }
    if (this.cursors.left.isDown) { //if the left arrow key is down
      this.ship.body.angularVelocity = -200; //rotate the ship to the left by giving it a rotational velocity of -200
    } else if (this.cursors.right.isDown) { //if the left cursor isnt down, but the right cursor is
      this.ship.body.angularVelocity = 200; //rotate the ship to the right by giving it a rotational velocity of 200
    }else{ //else
      this.ship.body.angularVelocity = 0; //set the rotational velocity of the ship to be zero (the ship stops spinning)
	}
  },

  boundries: function(object){ //declare the functino "boundries" and pass an object into it (when the variable is called in the update function we pass "this.ship"
    //SHIP BOUNDRIES
    if (object.body.position.x < 0){ //if the objects x position is less than zero (off the left side of the screen)
      object.body.position.x = game.width; //set the objects x position to the length of the screen (teleports the ship to the other side of the screen
    }else if (object.body.position.x > game.width){ //else if the object is off the right side of the screen
      object.body.position.x = 0; //teleport to the left side of the screen
    }
    if (object.body.position.y < 0){ //if the ship goes off the top of the screen
      object.body.position.y = game.height; //teleport to the bottom of the screen
    }else if (object.body.position.y > game.height){ //else if the object is off the bottom of the screen
      object.body.position.y = 0; //teleport to the top of the screen
    }
  },

  fire: function (angle) { //declare the function "fire" and pass a variable into it "angle"
      if (game.time.now > this.bulletTime) { //if the current game time is larger than the value of the variable "bulletTime"
        game.camera.shake(0.005, 100); //shake the screen with an intensity of 0.005 for 100 ms
        this.fireSound.play(); //play the sound "fireSound"
		//game.physics.arcade.accelerationFromRotation(this.ship.rotation, shipV, this.ship.body.acceleration); 
        let bullet = this.bullets.getFirstExists(false); //create a boolean called "bullet" that will be true when a bullet is created 
        if (bullet) { //if a bullet has been created 
          bullet.reset(this.ship.x , this.ship.y); //reset the position of the bullet to the x & y positions of the ship
          bullet.rotation = this.ship.rotation; //set the rotation of the bullet to be the same as the ship, this means it will fire in the correct direction
          game.physics.arcade.velocityFromRotation(this.ship.rotation + angle, 1000, bullet.body.velocity); //set the rotational velocity of the bullet to
		  //be 1000, but add the variable we passed to this function ("angle") to the starting rotation, "angle" is a slightly random number defined when the
		  //variable is called and will give the bullets a little bit of spread
          this.bulletTime = game.time.now + 150; //set the value of bulletTime to be the current time of the game + 150 ms, meaning the player has to wait 150ms
		  //for the next bullet to fire

        }
      }
    }, //end the fire function
  
  hit: function (bullet, enemy) { //declare a function called "hit" and pass "bullet" and "enemy" to it
    this.score = this.score + 10; //when the function is called, add 10 to "score"
    bullet.kill(); //destroy the bullet that is passed to the function
    enemy.kill(); //destroy the enemy that is passed to the function
	this.boom.play(); //play the sound effect "boom" 
	game.camera.flash(0xb2f197, 30); //add a screen flash that lasts for 30 ms with a hex value for the colour of #b2f197
    game.camera.shake(0.02, 300); //shake the camera for 300 ms with an intensity of 0.02
    //Create new enemies
	alienPos = (Math.random() * 800) + 1 //set the alien starting position on the x axis to be a random value between 0 and 800
    this.aliens.create(alienPos, - 25, 'enemy'); //create a new alien/asteroid that is off -25 y value and has the random x value
    this.aliens.create(alienPos, game.height + 25, 'enemy') //create a new alien/asteroid thats y value is the length of the screen +25 and has the random x value
    this.scoreDisplay.text = `Score: ${this.score} \nHighScore: ${this.highScore}`; //update the high score and score text with the correct values
  },

  shipGotHit: function (alien, ship) { //declare a function called shipGotHit and pass "alien" and "ship" to it
    this.lose.play(); //play the "lose" sound effect
	this.explosion.reset(this.ship.x + (this.ship.width / 2), this.ship.y + (this.ship.height / 2)); //set the position of the explosion to be at the position of
	//the ship
    this.ship.kill(); //kill the the player ship
    this.explosion.animations.play('boom'); //play the explosion animation
    this.gameOver(); //call the function "this.gameOver()"
  },
  
  gameOver: function () { //declare the function "gameOver"
    if (this.score > this.highScore) { //if the current score is larger than the high score
      this.highScore = this.score; //set the value of the high score to the value of the current score
      localStorage.setItem('invadershighscore', this.highScore); //save the new high score in the browser data
    }
    game.state.start('gameover'); //start the game state "gameover"
  },
}

const gameoverState = { //declare a new game state
	
  preload: function () { //open the preload function
    game.load.image('gameover', 'assets/gameover.png'); //load the asset "gameover.png" and call it "gameover"
	game.load.image('star', 'assets/star.png'); //load the asset "star.png" and call it "star"
  }, //close the preload function
  create: function () { //open the "create" function
	  	//CREATING THE STARFIELD
		for(let x = 0; x < 100; x ++){ //creating a loop that will run 100 times
			game.add.sprite(Math.random() * game.width, Math.random() * game.height, "star"); 
			//importing the star sprite and placing it in a random position on the screen
		} //Closing the Loop and continuing
	 i = 0;//creating a variable called "i" with a value of 0
	 game.add.text(50, 50, "GAME OVER", { font: '72px Courier', fill: '#88C070' }); //adding the text "GAME OVER" in the "Courier" font 50 pixels in on the x and 
     //50 pixels in on the y, set the size to 72 pixels big and give it a fill colour with a hex value of #88C070
	game.add.text(50, 122, "Press Space to Continue", { font: '42px Courier', fill: '#88C070' }); //create text as before that says "Press Space to continue" and
	//is lower down
    const gameOverImg = game.cache.getImage('gameover');//load the "gameover" image from the cache and assign it to the variable "gameOverImg"
    game.add.sprite(game.world.centerX - gameOverImg.width / 2, game.world.centerY - gameOverImg.height / 2, 'gameover');
	//create a sprite that is at the center of the screen on the x and y axis and load the "gameover" image as the sprite
	},
	update: function(){ //open the "update" function
		    game.camera.shake(0.005 + i/5000, game.time.now); //make the camera shake infinitely with an intensity of 0.005 +i/1000
			
			if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){ //if the space bar is held down
				game.add.text(50 + i, 172, i/50 + 1, {font: "42px Courier", fill: "#88C070"}); //add text that is 50 pixels + i on the x axis, 
				//and 172 pixels on the y axis, make that text show a number that is the value of i/50 + 1 
				i += 50; //add 50 to the value of i
					if(i >= 500){ //if i is less than 500
						game.state.start('main'); //start the main function
					}
			}	
		},
};

const game = new Phaser.Game(1024, 600); //create a new phaser game with the resolution of 1024p by 600p
game.state.add('main', mainState); //add the game state (level) "main" 
game.state.add('gameover', gameoverState); //add the game state (ending screen) "gameover"
game.state.start('main'); //start on the "main" game state
