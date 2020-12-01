const WebSocket = require("ws");
const fs = require("fs");

const wss = new WebSocket.Server({ port: 8080 });

const NS_PER_SEC = 1e9;
const NS_PER_MS = 1e6;
const uS_PER_MS = 1e3;

const IS_PASSIVE = false;
const PAYLOAD_SIZE = 5;

var sendCounter = 0;
var receiveCounter = 0;

var timeData = [];

wss.on("connection", function connection(ws) {
    var latestTime = process.hrtime();

    if (IS_PASSIVE) {
        ws.on("message", function incoming(message) {
            const diffTime = process.hrtime(latestTime);
            timeData.push((diffTime[0] * NS_PER_SEC + diffTime[1]) / NS_PER_MS);

            // ws.send("Received!");
            // console.log("Pesan diterima: " + message)
            // console.log(`Waktu menerima pesan: ${diffTime[0] * NS_PER_SEC + diffTime[1]} ns.`)
            receiveCounter++;

            if (receiveCounter > 5000) {
                fs.writeFile(
                    `data/ws-server-passive-${PAYLOAD_SIZE}.json`,
                    JSON.stringify(timeData),
                    (err) => {
                        if (err) {
                            throw err;
                        }

                        console.log("Data dalam bentuk json telah di save!");
                        process.exit();
                    }
                );
            }

            latestTime = process.hrtime();
        });
    } else {
        while (sendCounter < 10000) {
            payloadString = generatePayload(PAYLOAD_SIZE);
            ws.send(payloadString);
            sendCounter++;
            console.log("Sent : ", sendCounter);
        }

        ws.on("message", function incoming(message) {
            message = Number(message) / uS_PER_MS;
            timeData.push(message);

            receiveCounter++;
            console.log("Received : ", receiveCounter);

            if (receiveCounter >= 5000) {
                fs.writeFile(
                    `data/ws-server-active-${PAYLOAD_SIZE}.json`,
                    JSON.stringify(timeData),
                    (err) => {
                        if (err) {
                            throw err;
                        }

                        console.log("Data dalam bentuk json telah di save!");
                        process.exit();
                    }
                );
            }
        });
    }
});

function generatePayload(payloadLength) {
    var resultString = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < payloadLength; i++) {
        resultString += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }

    return resultString;
}
