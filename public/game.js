
var root;

function startup(){
	Audio.load();
	loadSkins();
	Audio.music.volume = .4;
	Audio.music.play();

	ourName = prompt("Enter your name:") || ''; // name!
	ourName = ourName.substring(0, 24);
	socket.emit('myNameIs', ourName); 

	// start lobby
	root = Lobby;
	Lobby.start();

}


function update(){
	root.update();
	Input.update();
	draw(c);	
}

function draw(g){
	root.draw(g)
}

(function(){
	startup();
	window.setInterval(update, 1000/30);
})();