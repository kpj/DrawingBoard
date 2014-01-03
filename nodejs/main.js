var server = require("./server");
var app = server.start();

var io = require('socket.io').listen(app);

var sockets = require("./socket_handler").implement(io);