
socket.on('playerUpdate', function(msg){
	// console.log(msg);
	var pid = msg[0]; // player id
	if(!pid)
		return;
	if(players[pid] == undefined){ // if player not found
		makePlayer(pid); // create it
	}
	players[pid].updateFromServerMessage(msg);
});

// player dc'd
socket.on('removePlayer', function(msg){
	delete players[msg];
});

socket.on('bulletUpdate', function(msg){
	// console.log(msg);
	makeBulletFromMessage(msg);
});

socket.on('removeBullet', function(msg){
	killBullet(msg);
});

var Gameplay = {
	bg: loadImage('/bg.png'),
	start: function(angle){

		this.ending = false;

		// place our player around the circle
		p1 = makePlayer(sid);
		p1.name = ourName;
		p1.skin = ourSkin;
		var r = 280;
		p1.x = WIDTH/2 + Math.cos(angle) * r;
		p1.y = HEIGHT/2 + Math.sin(angle) * r;
		p1.disableWeapon = true;
		OverlayText.display("Ready", 30 * 1.75);
		setTimeout(function(){OverlayText.display("Go!", 30 * 1), p1.disableWeapon = false;}, 1000 * 2);

		p1.updateServer();

	},
	ending: false,
	endGame: function(){
		socket.emit('gameEnded');

		// reset objects
		players = {};
		bullets = [];

		// switch to lobby
		root = Lobby;
		Lobby.start();
	},
	update: function(){

		OverlayText.update();

		// check if game over
		var numAlive = 0;
		var anAlivePlayer = null;
		for (var id in players) {
		    if (players.hasOwnProperty(id)) {
		        players[id].update();
		        if(players[id].health > 0){
		        	numAlive++;
		        	anAlivePlayer = players[id];
		        }
		    }
		}

		// update bullets
		// tmp array is in case bullet gets destroyed in loop
		var bulletsTmp = [];
		for(var i = 0; i < bullets.length; i++){
			bulletsTmp.push(bullets[i]);
		}
		for(var i = 0; i < bulletsTmp.length; i++){
			bulletsTmp[i].update();
		}

		p1.checkCollisions(); // check for collisions on ourself only

		// if game should be ending, start ending
		if(!this.ending && numAlive < 2 && p1.disableWeapon == false){
			this.ending = true;
			var winText = 'Draw!';
			if(anAlivePlayer != null){
				winText = anAlivePlayer.name + ' wins!';
			}
			OverlayText.display(winText, 30 * 2.5);
			setTimeout(function(){Gameplay.endGame();}, 1000 * 3);
		}
	},
	draw: function(g){
		g.fillStyle = "#2a2a2a";
		g.fillRect(0,0,WIDTH,HEIGHT);

		g.drawImage(this.bg, 0, 0);

		for(var i = 0; i < bullets.length; i++){
			bullets[i].draw(g);
		}
		for (var id in players) {
		    if (players.hasOwnProperty(id)) {
		        players[id].draw(g);
		    }
		}
		

		OverlayText.draw(g);
	}
};
