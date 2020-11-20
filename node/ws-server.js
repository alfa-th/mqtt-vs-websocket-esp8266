var WebSocketServer = require("websocket").server;
var http = require("http");

// Inisialiasi sebuah server HTTP, tapi jangan dibuat agar
// server HTTP bisa diakses selain untuk WebSocket
var server = http.createServer(function (server, response) {
    console.log(
        new Date() + ": Mendapatkan sebuah request pada " + request.url
    );
    response.writeHead(404);
    response.end();
});

// Jalankan server pada port 8080
server.listen(8080, function () {
    console.log(new Date() + ": Server is listening on port 8080");
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false,
});

function originIsAllowed(origin) {
    // Lakukan pengecekan untuk menentukan apabila origin diperbolehkan
    // untuk mengakses WebSocket
    return true;
}

wsServer.on("request", function (request) {
    if (!originIsAllowed(request.origin)) {
        request.reject();
        console.log(
            new Date() + ": Koneksi dari origin " + request.origin + " ditolak."
        );

        return;
    }

    var connection = request.accept("echo-protocol", request.origin);
    console.log(
        new Date() + ": Koneksi dari origin " + request.origin + " diterima."
    );

    connection.on("message", function (message) {
        if (message.type === "utf8") {
            console.log("Mendapatkan pesan utf8 : " + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        } else if (message.type === "binary") {
            console.log(
                "Mendapatkan pesan binary : " +
                    message.binaryData.length +
                    " byte."
            );
            connection.sendUTF(message.binaryData);
        }
    });

    connection.on("close", function (reasonCode, description) {
        console.log(
            new Date() + ": Peer " + connection.remoteAddress + " disconnected."
        );
    });
});
