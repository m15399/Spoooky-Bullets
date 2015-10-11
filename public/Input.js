
var Input = {
	l: false,
	r: false,
	u: false,
	d: false,
	mx: 0,
	my: 0,
	mouseWasClicked: false,
	dirty: false,
	update: function(){
		this.dirty = false;
		this.mouseWasClicked = false;
	}
};


window.onkeydown=function(e){
	// e.preventDefault();
	checkKeys(e.keyCode, true);
}

window.onkeyup=function(e){
	e.preventDefault();
	checkKeys(e.keyCode, false);
}

canvas.onmousemove=function(e){
	Input.mx = e.layerX;
	Input.my = e.layerY;
}

canvas.onmousedown=function(e){
	e.preventDefault();
	Input.mouseWasClicked = true;
}

function checkKeys(code, val){
	switch(code){

			case 65: // left
			if(Input.l != val){
				Input.l = val;
				keyUpdated('l', val);
			}
			break;

			case 68: // right
			if(Input.r != val){
				Input.r = val;
				keyUpdated('r', val);
			}
			break;

			case 87: // up
			if(Input.u != val){
				Input.u = val;
				keyUpdated('u', val);
			}
			break;

			case 83: // down
			if(Input.d != val){
				Input.d = val;
				keyUpdated('d', val);
			}
			break;

			default:
			// console.log(code);
		}
}

function keyUpdated(key, val){
	// console.log(key + ' = ' + val);
	Input.dirty = true;
}

