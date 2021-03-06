var express = require('express');
var saved = {};
var pass = {};
var users = {};
var groupIds = {};
var app = express();
var server = app.listen(3000);
var id = 0;

// var SOCKETS = {};

app.use(express.static('public'));


var socket = require('socket.io');

var io = socket(server);

io.sockets.on('connection', newConnection);



function newConnection(socket) {
	// socket.loged = false;
	// SOCKETS[socket.id] = socket;
	socket.on('checkLogin', checkLogin);

	function checkLogin(user) {
		if(!groupIds[user.groupName] || !groupIds[user.groupName].length) {
			groupIds[user.groupName] = [];
			pass[user.groupName] = user.pass;
			saved[user.groupName] = [];
		}

		if(pass[user.groupName] === user.pass) {
			users[socket.id] = user.groupName;
			groupIds[user.groupName].push(socket);
		}
		console.log("Somebody joined " + user.groupName);
		socket.emit('loggedIn', (pass[user.groupName] === user.pass));
	}

	socket.on('getData', sendData);

	function sendData() {
		if(!users[socket.id] || !saved[users[socket.id]])return;
		// console.log("Tried to check but smth went wrong :-( " + saved[users[socket.id]].length);
		// console.log(saved[users[socket.id]].length);
		for(var i = 0; i < saved[users[socket.id]].length; ++i) {
			socket.emit('mouse', saved[users[socket.id]][i]);
		}
	}

	socket.on('mouse', mouseMsg);

	function mouseMsg(data) {
		if(!saved[users[socket.id]]) {
			saved[users[socket.id]] = [];
		}
		saved[users[socket.id]].push(data);
		// console.log("added " + data + " in " + users[socket.id] + " then size become " + saved[users[socket.id]].length);
		for(var i = 0; i < groupIds[users[socket.id]].length; ++i) {
			groupIds[users[socket.id]][i].emit('mouse', data);
		}
	}

	socket.on('disconnect', function () {
		if(users[socket.id] !== null && groupIds[users[socket.id]]) {
			console.log("Somebody left " + users[socket.id]);
	    var index = groupIds[users[socket.id]].indexOf(socket);
			if(index > -1) {
				groupIds[users[socket.id]].splice(index, 1);
			}
			if(!groupIds[users[socket.id]].lenght) {
				console.log("Deleted");
				saved[users[socket.id]] = [];
				pass[users[socket.id]] = null;
			}
			console.log("Now size of " + users[socket.id] + " is " + groupIds[users[socket.id]].length);
			users[socket.id] = null;
		}
  });
}
