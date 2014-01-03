var http = require("http");
var url = require("url");
var fs = require("fs");

var util = require("util");
var utils = require("./utils");


function start() {
	function handleRequest(request, response) {
		/// handle incoming data
		if(request.method == "POST") {
			var chunk = "";

			request.on("data", function(data) {
				chunk += data;
			});
			request.on("end", function() {
				console.log("Blub: " + chunk);
			});
		} else {
			var path = url.parse(request.url).pathname;
			console.log("Received request: " + path);
			if(path == "/" || path == "/index.html")
				path = "/html/index.html";

			fs.readFile("." + path, function(error, data) {
				if(data === undefined)
					return;

				data = data.toString('utf8');
				if(path == "/js/core.js") {
					var protocol = (request.connection.encrypted === undefined) ? "http" : "https";
					var host = request.headers.host;
					data = util.format(data, protocol, host);
				}
				response.end(data);
			});
		}
	}

  var app = http.createServer(handleRequest).listen(4242);
  console.log("Server started");
  return app;
}

exports.start = start;