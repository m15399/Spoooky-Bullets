
var WIDTH = 800;
var HEIGHT = 600;

var ourName = 'defaultdefaultdefaultdefaultdefault';

var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");
c.mozImageSmoothingEnabled = false;
c.webkitImageSmoothingEnabled = false;
c.msImageSmoothingEnabled = false;
c.imageSmoothingEnabled = false;

var players = {};
var p1;

var bullets = [];

var numSkins = 4;
var skins = [];
var ourSkin = 0;

function loadSkins(){
	for(var i = 0; i < numSkins; i++){
		skins[i] = loadImage('/' + i + '.png');
	}
}

function loadImage(path){
	var img = new Image();
	img.setAttribute('src', path);
	return img;
}