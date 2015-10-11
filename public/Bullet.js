
var MIN_SPEED = .5;
var MAX_SPEED = 18;
var SIZE = 10;
var MAX_SIZE = 22;

var SPOOKINESS = 8; // how wavy
var SPOOKY_SPEED = .5; // how fast it waves

var TRAIL_DENSITY = 4; // ghost trail
var TRAIL_LENGTH = 4;

var _Bullet = {
	id: 0,
	x: 0,
	y: 0,
	vx: 0,
	vy: 0,
	trackX: 0, // track is standard location before waviness
	trackY: 0,
	axisX: 0,
	axisY: 0,
	size: 8,
	speed: 0,
	power: 0,
	time: 0,
	prevPositions: null, 
	ownedByP1: false,
	update: function(){
		this.trackX += this.vx * this.speed;
		this.trackY += this.vy * this.speed;
		
		// update ghost trail
		if(this.time % TRAIL_DENSITY == 0){
			this.prevPositions.push(this.x);
			this.prevPositions.push(this.y);
			if(this.prevPositions.length > 2 * TRAIL_LENGTH){
				this.prevPositions = this.prevPositions.slice(2);
			}
		}

		// wave the bullet away from track
		var mul = Math.sin(this.time / (1 / SPOOKY_SPEED)) * SPOOKINESS;
		this.x = this.trackX + mul * this.axisX;
		this.y = this.trackY + mul * this.axisY;

		this.time++;

		// check if outside screen
		if(this.ownedByP1){
			var padding = 50;
			if(this.x > WIDTH + padding || this.x < -padding || 
				this.y < -padding || this.y > HEIGHT + padding){
				killBulletAndUpdateServer(this.id);
			}
		} 
	},
	updateServer: function(){
		socket.emit('bulletUpdate', [this.id, this.trackX, this.trackY, this.vx, this.vy, this.power]);
	},
	draw: function(g){
		// ghost trail
		var s = 'rgba(255, 255, 255, ';
		if(this.ownedByP1)
			s = 'rgba(0, 175, 255, ';
		for(var i = 0; i < this.prevPositions.length; i+=2){
			var x = this.prevPositions[i];
			var y = this.prevPositions[i+1];

			g.fillStyle = 'rgba(255, 255, 255, '+ ((i/this.prevPositions.length)/3) +')';
			g.fillRect(x-this.size/2, y-this.size/2, this.size, this.size);
		}

		// bullet
		g.fillStyle = 'white';
		if(this.ownedByP1)
			g.fillStyle = '#33aaff';
		g.fillRect(this.x-this.size/2, this.y-this.size/2, this.size, this.size);
	}
};

function makeBullet(id, x, y, vx, vy, power){
	Audio.shot.play();

	var o = Object.create(_Bullet);

	// i think this keeps bullet id's from colliding
	if(id > _currBulletId - 10)
		_currBulletId += 20;

	o.id = id;
	o.trackX = o.x = x;
	o.trackY = o.y = y;
	o.vx = vx;
	o.vy = vy;
	o.power = power;
	// speed is slower with less power
	o.speed = Math.max(MIN_SPEED / MAX_SPEED, power) * MAX_SPEED;
	o.prevPositions = [];
	// size is bigger with less power
	o.size = SIZE / Math.max(SIZE / MAX_SIZE, power);
	// velocity rotated by 90 degrees
	o.axisX = -vy;
	o.axisY = vx;

	bullets.push(o);

	return o;
}

var _currBulletId = -99999;
function nextBulletId(){
	return _currBulletId++;
}

function makeBulletFromMessage(msg){
	makeBullet(msg[0], msg[1], msg[2], msg[3], msg[4], msg[5]);
}

function killBulletAndUpdateServer(id){
	killBullet(id);
	socket.emit('removeBullet', id);
}

function killBullet(id){
	for(var i = 0; i < bullets.length; i++){
		if(bullets[i].id == id){
			bullets.splice(i, 1);
			break;
		}
	}

}

