var WebSocketClient = require("websocket").client;
var Readline = require("readline");

var client = new WebSocketClient();
const readline = Readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

client.on("connectFailed", function (error) {
    console.log("Proses koneksi error: " + error.toString());
});

client.on("connect", function (connection) {
    console.log("Klien WebSocket berhasil terkoneksi.");

    connection.on("error", function (error) {
        console.log("Koneksi error: " + error.toString());
    });

    connection.on("close", function () {
        console.log("Koneksi echo-protocol tertutup.");
    });

    connection.on("message", function (message) {
        if (message.type === "utf8") {
            console.log(
                new Date() + ": Pesan baru: '" + message.utf8Data + "'"
            );
        }
    });

    if (connection.connected) {
        function kirimPesan() {
            connection.sendUTF("Waow");
            setTimeout(kirimPesan, 1000);
        }

        kirimPesan();
    }
});

client.connect("ws://localhost:8080/", "echo-protocol");
