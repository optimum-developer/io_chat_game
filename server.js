var express = require('express');  
var app = express();  
var server = require('http').createServer(app);  
var io = require('socket.io').listen(server);
var flag = 0;

users=[];
connections = [];

server.listen(process.env.PORT || 3000);  
console.log('Server running...');

app.get('/', function(req, res) {  
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	connections.push(socket);
	console.log('Connected: %s sockets connected', connections.length);

    socket.on('disconnect', function(data){
    if(!socket.username) return;
    users.splice(connections.indexOf(socket.username), 1);
    updateUserNames();
	connections.splice(connections.indexOf(socket), 1);
	console.log('Disonnected: %s sockets connected', connections.length);
    })
	socket.on('send message', function(data){
		// console.log(data);
		io.sockets.emit('new message', {msg: data, user: socket.username}); 
	});
	socket.on('box click', function(data){
		// console.log(data);
		io.sockets.emit('box fill', {box_fill_id: data, user: socket.username});
		flag = flag + 1 
		if (flag == 9){
			flag = 0;
			calculateWinner();
		}
	});
	
	//new user
	socket.on('new user', function(data, callback){
		callback(true);
		socket.username = data;
		users.push(socket.username);
		updateUserNames();
	});
	function updateUserNames(){
		io.sockets.emit('get users', users);
	};
	function calculateWinner(){
		io.sockets.emit('calc winner', users);
		console.log(users);
	}
})
