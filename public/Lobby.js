

var _Button = {
	x: 0,
	y: 0,
	w: 0,
	h: 0,
	callback: function(){},
	text: '',
	color: '#bbb',
	skinNum: -1,
	mouseIsOver: function(){ // check if mouse is on us
		var mx = Input.mx;
		var my = Input.my;

		if(mx > this.x && mx < this.x + this.w && 
			my > this.y && my < this.y + this.h){

			return true;
		}
	},

	checkForClick: function(){ 
		if(Input.mouseWasClicked && this.mouseIsOver()){
			this.callback();
			Input.mouseWasClicked = false;
		}
	},

	draw: function(g){
		g.fillStyle = this.color;
		g.fillRect(this.x, this.y, this.w, this.h);

		// draw text
		g.fillStyle = 'black';
		g.font = '24px Arial';
		var xOff = g.measureText(this.text).width/2;
		g.fillText(this.text, this.x - xOff + this.w/2, this.y + this.h/2 + 6);

		// draw image
		if(this.skinNum >= 0){
			var image = skins[this.skinNum];
			g.drawImage(image, this.x + this.w/2 - image.width/2, 
				this.y + this.h/2 - image.height/2);
		}

		// lighten if mouse is over
		if(this.mouseIsOver()){
			g.fillStyle = 'rgba(255, 255, 255, .3)';
			g.fillRect(this.x, this.y, this.w, this.h);
		}

	}
}

var buttons = [];

function makeButton(x, y, w, h, callback){
	var o = Object.create(_Button);

	o.x = x;
	o.y = y;
	o.w = w;
	o.h = h;
	o.callback = callback;

	buttons.push(o);
	return o;
}

socket.on('updateLobby', function(msg){
	msg.players.sort(function(a, b){
		if(a.name > b.name)
			return 1;
		return 0;
	});

	Lobby.lobby = msg;
});

socket.on('startGame', function(msg){
	if(root == Lobby)
		Lobby.startGame(msg);
});

var Lobby = {
	timer: 0,
	lobby: {players: [], status: ''},
	ready: false,
	readyButton: null,
	skinButtons: [],
	instructions: loadImage('/instructions.png'),
	start: function(){
		this.ready = false;
		this.lobby = {players: [], status: ''};
		this.timer = 0;

		// add buttons
		if(buttons.length == 0){
			// skin buttons
			var xo = 575;
			var yo = 375;
			var bs = 55;
			var pad = 15;
			var totalW = numSkins * bs + (numSkins-1) * pad;
			for(var i = 0; i < numSkins; i++){
				var b = makeButton(xo - totalW/2 + (pad+bs) * i, yo, bs, bs, function(){
					ourSkin = this.skinNum;
					// highlight us, dehiglight everyone else
					for(var i = 0; i < Lobby.skinButtons.length; i++){
						Lobby.skinButtons[i].color = '#bbb';
					}
					this.color = '#eee';
				});
				b.skinNum = i;
				this.skinButtons.push(b);

				// default highlight 0
				if(i == 0)
					b.color = '#eee';
			}

			// make buttons
			readyButton = makeButton(425, 450, 300, 75, function(){
				Lobby.ready = !Lobby.ready;

				socket.emit('setReady', Lobby.ready);

				if(!Lobby.ready)
					this.text = 'Click when ready';
				else 
					this.text = 'Ready!';
			});
		}
		readyButton.text = 'Click when ready';

	},
	update: function(){
		// request update from server every once in a while
		this.timer++;
		if(this.timer % 45 == 0){
			socket.emit('updateLobby');
		}

		// update buttons
		for(var i = 0; i < buttons.length; i++){
			buttons[i].checkForClick();
		}
	},
	startGame: function(angle){
		socket.emit('setReady', false);
		root = Gameplay;
		Gameplay.start(angle);
	},
	draw: function(g){
		g.fillStyle = 'hsl(230, 32%, 50%)';
		g.fillRect(0,0,WIDTH,HEIGHT);

		// draw leaderboard
		g.font = '16px Arial';
		var lx = 50;
		var ly = 50;
		for(var i = 0; i < this.lobby.players.length; i++){

			var p = this.lobby.players[i];

			g.fillStyle = 'white';
			g.fillText(p.name, lx + 26, ly);
			if(p.ready)
				g.fillStyle = '#0f0';
			else
				g.fillStyle = '#c00';
			g.fillRect(lx, ly - 14, 16, 16);

			ly += 20;
		}

		// buttons
		for(var i = 0; i < buttons.length; i++){
			buttons[i].draw(g);
		}

		// status
		g.fillStyle = 'white';
		g.font = '24px Arial';
		g.fillText(this.lobby.status, 475, 570);

		g.font = '12px Arial';
		g.fillText('Created by Mark Gardner, Music by purple-planet.com', 10, 590);

		g.drawImage(this.instructions, 350, 0);

	}

};