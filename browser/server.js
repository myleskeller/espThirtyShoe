//* http server nodejs stuff
var fs = require("fs");
var url = require("url");
// static file http server
// serve files for application directory
var root = "web";
var http = require("http").createServer(handle);

function handle(req, res) {
  var request = url.parse(req.url, false);
  console.log("Serving request: " + request.pathname);

  var filename = request.pathname;

  if (filename == "/") { filename = "/index.html"; }

  filename = root + filename;

  try {
    fs.realpathSync(filename);
  } catch (e) {
    res.writeHead(404);
    res.end();
  }

  var contentType = "text/plain";

  if (filename.match(".js$")) {
    contentType = "text/javascript";
        //! you'll probably need to make one for css as well
  } else if (filename.match(".html$")) {
    contentType = "text/html";
  }

  fs.readFile(filename, function (err, data) {
    if (err) {
      res.writeHead(500);
      res.end();
      return;
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.write(data);
    res.end();
  });
}

http.listen(8080);

console.log("server started on localhost:8080");