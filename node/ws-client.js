const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:8080/");

ws.on("open", function open() {
    function sendPog() {
        ws.send((new Date()) + " from node client");
        setTimeout(sendPog, 3000)
    }
    sendPog()
});

ws.on("message", function incoming(data) {
    console.log(data);
});