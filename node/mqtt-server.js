const aedes = require("aedes")();
const server = require("net").createServer(aedes.handle);
const port = 1883;

server.listen(port, function () {
    console.log("Server started on localhost and listening on port", port);    
});
