
var PLAYER_SIZE = 24;
var RELOAD_TIME = 30 * .5;
var MAX_BAR = 30 * 2;
var SHOT_COST = MAX_BAR / 1.3;
var INVULNERABLE_TIME = 30 * 1.5;
var MOVE_SPEED = 5; //4;
var MAX_HEALTH = 3;

var _Player = {
	x: WIDTH/2,
	y: HEIGHT/2,
	xDir: 0,
	yDir: 0,
	speed: MOVE_SPEED,
	size: PLAYER_SIZE,
	name: '',
	timeSinceLastServerUpdate: 0,
	chargeTime: 0,
	invulnerableTime: INVULNERABLE_TIME,
	reloadTime: 0,
	health: MAX_HEALTH,
	disableWeapon: false,
	skin: 0,
	update: function(){

		if(this.health <= 0)
			return;

		if(this.reloadTime <= 0){
			this.chargeTime++;
			if(this.chargeTime > MAX_BAR)
				this.chargeTime = MAX_BAR;
		} else {
			this.reloadTime--;
		}

		if(this.invulnerableTime > 0)
			this.invulnerableTime--;

		// check input for local player
		if(this == p1 ){

			// direction
			if(Input.dirty){
				this.xDir = 0;
				this.yDir = 0;
				if(Input.l)
					this.xDir -= 1;
				if(Input.r)
					this.xDir += 1;
				if(Input.u)
					this.yDir -= 1;
				if(Input.d)
					this.yDir += 1;

				this.updateServer();
				Input.dirty = false;
			}

			// fire
			if(Input.mouseWasClicked){
					
				// mouse vector
				var dmx = Input.mx - this.x;
				var dmy = Input.my - this.y;
				var dist = dmx * dmx + dmy * dmy;
				dist = Math.sqrt(dist);

				// bullet vector
				var dbx = dmx / dist;
				var dyx = dmy / dist;
				
				var fire = false;
				if(!this.disableWeapon && this.reloadTime <= 0){
					fire = true;
				}

				// fire a bullet
				if(fire){
					var addDist = PLAYER_SIZE + 5; // move bullet away from player center

					var b = makeBullet(nextBulletId(), this.x + addDist * dbx, this.y + addDist * dyx, 
						dbx, dyx, this.getPower());
					b.updateServer();
					b.ownedByP1 = true;

					Input.mouseWasClicked = false;

					// update charge
					this.chargeTime -= SHOT_COST;
					if(this.chargeTime < 0)
						this.chargeTime = 0;

					// reloat
					this.reloadTime = RELOAD_TIME;

				}
				
			}

			// update if too much time passed
			this.timeSinceLastServerUpdate++;
			if(this.timeSinceLastServerUpdate > 30){
				this.updateServer();
			}
		}

		// move player
		this.x += this.xDir * this.speed;
		this.y += this.yDir * this.speed;

		// keep inside screen
		var s2 = this.size/2;
		if(this.x < s2)
			this.x = s2;
		if(this.y < s2)
			this.y = s2;
		if(this.x > WIDTH - s2)
			this.x = WIDTH - s2;
		if(this.y > HEIGHT - s2)
			this.y = HEIGHT - s2;

		
	},
	getBar: function(){
		return Math.max(0, Math.min(this.chargeTime, MAX_BAR) / MAX_BAR);
	},
	getPower: function(){
		var max = SHOT_COST;
		var have = Math.max(0, Math.min(this.chargeTime, MAX_BAR));
		var actual = have;
		if(actual > max)
			actual = max;

		return actual / max;
	},
	checkCollisions: function(){

		if(this != p1)
			return; // oops!

		if(this.invulnerableTime > 0)
			return;

		if(this.health <= 0)
			return;

		for(var i = 0; i < bullets.length; i++){
			var b = bullets[i];
			if(b.ownedByP1)
				continue;

			var dx = b.x - this.x;
			var dy = b.y - this.y;
			var dist = Math.sqrt(dx * dx + dy * dy);
			if(dist < this.size + b.size - 5){
				// was hit by bullet


				killBulletAndUpdateServer(b.id);
				
				this.health--;
				this.invulnerableTime = INVULNERABLE_TIME;
				this.updateServer();
				break;

			}
		}

	},
	draw: function(g){

		if(this.health <= 0)
			g.fillStyle = 'rgba(255, 255, 255, .5)';
		else if(this == p1)
			g.fillStyle = '#33ffbb';
		else 
			g.fillStyle = 'white';

		// draw name
		g.font = '12px Arial';
		var yOff = -16;
		var xOff = g.measureText(this.name).width/2;
		g.fillText(this.name, this.x - xOff, this.y + yOff);

		// draw health bar
		var hw = PLAYER_SIZE / 2.5;
		var hoy = 16;
		for(var i = 0; i < this.health; i++){
			g.fillRect(this.x + hw * (i-1.5) + 1, this.y + hoy, hw - 1, 2);
		}

		// draw player
		if(this.health > 0 && !(this.invulnerableTime > 0 && Math.sin(this.invulnerableTime * 1) > 0)){
			// g.fillRect(this.x-this.size/2, this.y-this.size/2, this.size, this.size);
			g.drawImage(skins[this.skin], this.x-18, this.y-18);
		}

		// draw power bar of local player
		if(this == p1){
			var barw = 100;
			var barh = 20;
			var barx = 10;
			var bary = HEIGHT - barh - 10;
			g.fillStyle = "black";
			g.fillRect(barx, bary, barw, barh);
			g.fillStyle = "yellow";
			g.fillRect(barx, bary, barw * this.getBar(), barh);
		}
	},
	updateServer: function(){
		socket.emit('playerUpdate', [sid, this.name, this.x, this.y, this.xDir, this.yDir, 
			this.invulnerableTime, this.health, this.skin]);
		this.timeSinceLastServerUpdate = 0;
	},
	updateFromServerMessage: function(msg){
		this.name = msg[1];
		this.x = msg[2];
		this.y = msg[3];
		this.xDir = msg[4];
		this.yDir = msg[5];
		this.invulnerableTime = msg[6];
		var h = this.health;
		this.health = msg[7];
		if(this.health < h)
			Audio.hit.play();
		this.skin = msg[8];
	}
}

function makePlayer(id){

	var o = Object.create(_Player);
	
	players[id] = o;

	return o;

}