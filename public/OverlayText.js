
var OverlayText = {
	text: 'default',
	timeleft: 0,
	display: function(text, time){
		this.timeleft = time;
		this.text = text;
	},
	update: function(){
		if(this.timeleft > 0)
			this.timeleft--;
	},
	draw: function(g){
		if(this.timeleft <= 0)
			return;
		g.font = '60px Arial';
		var m = g.measureText(this.text).width;
		var yoff = -16;
		g.fillStyle = 'black';
		var o = 3;
		g.fillText(this.text, WIDTH/2 - m/2 + o, HEIGHT/2 + yoff + o * 2);
		g.fillStyle = 'white';
		g.fillText(this.text, WIDTH/2 - m/2, HEIGHT/2 + yoff);

	}
};
