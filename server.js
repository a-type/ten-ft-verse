var http = require("http"),
		url = require("url"),
		path = require("path"),
		fs = require("fs")
		port = process.argv[2] || 8080,
		apiKey = process.env["BIBLIA_API_SECRET"];


if (!apiKey) {
	console.log("No Biblia.com API secret key provided. Shutting down.");
} else {
	http.createServer(function(request, response) {

		var uri = url.parse(request.url).pathname
			, filename = path.join(process.cwd(), uri);

		var contentTypesByExtension = {
			'.html': "text/html",
			'.css':  "text/css",
			'.js':   "text/javascript"
		};

		fs.exists(filename, function(exists) {
			if(!exists) {
				response.writeHead(404, {"Content-Type": "text/plain"});
				response.write("404 Not Found\n");
				response.end();
				return;
			}

			if (fs.statSync(filename).isDirectory()) filename += '/index.html';

			fs.readFile(filename, "binary", function(err, file) {
				if(err) {        
					response.writeHead(500, {"Content-Type": "text/plain"});
					response.write(err + "\n");
					response.end();
					return;
				}
				
				//shim: if this is search.js, replace API token with value from env vars
				if (filename.indexOf("search.js")) {
					file = file.replace("{{ API_KEY }}", apiKey);
				}

				var headers = {};
				var contentType = contentTypesByExtension[path.extname(filename)];
				if (contentType) headers["Content-Type"] = contentType;
				response.writeHead(200, headers);
				response.write(file, "binary");
				response.end();
				console.log("Served " + filename);
			});
		});
	}).listen(parseInt(port, 10));

	console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
}