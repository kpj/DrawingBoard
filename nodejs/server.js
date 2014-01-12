var http = require("http");
var url = require("url");
var fs = require("fs");

var util = require("util");
var utils = require("./utils");


function getMIMEType(path) {
	var end = path.split('.').pop();

	if(end == "html")
		return "text/html";
	else if(end == "js")
		return "text/javascript";
	else if(end == "css")
		return "text/css";
	else
		return "text/plain"
}

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

			// handle MIME type
			response.setHeader('Content-Type', getMIMEType(path));

			fs.readFile("." + path, function(error, data) {
				if(data === undefined)
					return;

				data = data.toString('utf8');
				if(path.indexOf("dynamic_server_connection_handler.js") != -1) {
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