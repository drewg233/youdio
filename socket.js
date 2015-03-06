var usernames = {};
var playlist = [];
var rooms = [];

io.sockets.on('connection', function (socket) {
	socket.on('adduser', function(data) {
		if (data.username != '') {
			socket.username = data.username;
			socket.room = data.chatHash;
			socket.join(socket.room);
			socket.emit('updatechat', {message: "You have connected to " + socket.room});
			if (playlist[socket.room] === undefined) {
			} else {
				socket.emit('starting playlist', playlist[socket.room]);
			}
			socket.broadcast.to(socket.room).emit('updatechat', {message: socket.username + ' has connected to this room'});
			if (usernames[socket.room] === undefined) {
				usernames[socket.room] = [];
				usernames[socket.room].push(socket.username);		
			} else {
				if (usernames[socket.room].indexOf(socket.username) < 0) {
					usernames[socket.room].push(socket.username);
				}
			}
			updateUsers(socket.room);
		} else {
			socket.room = data.chatHash;
			socket.join(socket.room);
			updateUsers(socket.room);
		}
	});

	socket.on('search video', function(data){
		youtube.search(data, 10, function(resultData) {
			socket.emit('update results', resultData);
		});
	});

	socket.on('deletefirst videoserver', function(){
		playlist[socket.room].shift();
		console.log("HERES THE PLAYLIST: " + playlist[socket.room])
		io.sockets.in(socket.room).emit('deletefirst video');
	});

	socket.on('play videoserver', function(username){
		io.sockets.in(socket.room).emit('play video', username);
	});

	socket.on('pause videoserver', function(username, currentVideoTime){
		console.log("video time: " + currentVideoTime);
		io.sockets.in(socket.room).emit('pause video', username, currentVideoTime);
	});

	socket.on('add video', function(username, video){
		if (playlist[socket.room] === undefined) {
			playlist[socket.room] = [];
		}
		// playlist[socket.room].push(videoID);
		playlist[socket.room].push(video);
		console.log("HERES THE PLAYLIST: " + playlist[socket.room])
		io.sockets.in(socket.room).emit('updateplaylist', username, video, playlist[socket.room]);
	});
	
	socket.on('sendchat', function (data) {
		console.log(data);
		socket.broadcast.to(data.room).emit('updatechat', data);
	});
	
	socket.on('disconnect', function(){
		if (socket.username != undefined) {
			io.sockets.emit('updateusers', usernames);
			io.sockets.in(socket.room).emit('updatechat', {message: socket.username + ' has disconnected'});
			socket.leave(socket.room);		
			if (socket.username !== undefined) {
				var user_index = usernames[socket.room].indexOf(socket.username);
			    if (user_index > -1) {
				    usernames[socket.room].splice(user_index, 1);
				}
			}
			updateUsers(socket.room);
		}
	});
});

function updateUsers(room) {
	io.sockets.in(room).emit('updateusers', usernames[room]);
}

var indexOf = function(needle) {
	if(typeof Array.prototype.indexOf === 'function') {
	  indexOf = Array.prototype.indexOf;
	} else {
	  indexOf = function(needle) {
	    var i = -1, index = -1;
	    for(i = 0; i < this.length; i++) {
	      if(this[i] === needle) {
	        index = i;
	        break;
	      }
	    }
	    return index;
	  };
	}
	return indexOf.call(this, needle);
};