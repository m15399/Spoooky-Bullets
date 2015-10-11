
/*

This file contains the server code for the game.

*/

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


var statuses = ["Waiting for players", "Game in progress"]
var status = 0;

var numPlayers = 0;

io.on('connection', function(socket){
  console.log('a user connected ' + socket.id);

  socket.playerName = '';
  socket.playerReady = false;
  numPlayers++;

  // socket.emit('welcome', io.sockets.connected[socket.id].id);
  socket.emit('welcome', socket.id);

  socket.on('myNameIs', function(msg){
  	socket.playerName = msg;
  });

  // player clicked ready button
  socket.on('setReady', function(msg){
  	socket.playerReady = msg;

  	// count players and start game if enough ready
  	var numReady = 0;
  	for (var id in io.sockets.connected) {
	    if (io.sockets.connected.hasOwnProperty(id)) {
	        var sock = io.sockets.connected[id];
	        if(sock.playerReady)
	        	numReady ++;
	    }
	}
	if(numReady >= numPlayers * 2 / 3){
		startGame();
	}

  });

  function startGame(){
  	if(status == 0){
  		status = 1;

  		// send a start game to each player, with an angle around a circle
  		var num = 0;
  		for (var id in io.sockets.connected) {
		    if (io.sockets.connected.hasOwnProperty(id)) {
		        var sock = io.sockets.connected[id];
		        
		        var angle = num / numPlayers * Math.PI * 2;
		        num++;

		        sock.emit('startGame', angle);
		    }
		  }
  	}
  }

  socket.on('gameEnded', function(msg){
  	status = 0;
  });

  // send player list of players and status
  socket.on('updateLobby', function(msg){

  	var lobby = {
  		players: [],
  		status: statuses[status]
  	};

  	//  list of players, ready states
  	for (var id in io.sockets.connected) {
	    if (io.sockets.connected.hasOwnProperty(id)) {
	        var sock = io.sockets.connected[id];
	        lobby.players.push({name:sock.playerName, ready:sock.playerReady});

	    }
  	}


  	socket.emit('updateLobby', lobby);
  });

  socket.on('playerUpdate', function(msg){
  	socket.broadcast.emit('playerUpdate', msg);
  });

  socket.on('bulletUpdate', function(msg){
  	socket.broadcast.emit('bulletUpdate', msg);
  });

  socket.on('removeBullet', function(msg){
  	socket.broadcast.emit('removeBullet', msg);
  });

  socket.on('dcAll', function(msg){
    for (var id in io.sockets.connected) {
      if (io.sockets.connected.hasOwnProperty(id)) {
        var sock = io.sockets.connected[id];
        console.log('disconeccting ' + sock.id);  
        sock.disconnect();
      }
    }
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
    numPlayers--;
    socket.broadcast.emit('removePlayer', socket.id);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});