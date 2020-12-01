const mqtt = require("mqtt");
const fs = require("fs");
const client = mqtt.connect("mqtt://127.0.0.1");

const NS_PER_SEC = 1e9;
const NS_PER_MS = 1e6;
const uS_PER_MS = 1e3;

const IS_PASSIVE = false;
const PAYLOAD_SIZE = 100;

var sendCounter = 0;
var receiveCounter = 0;

var timeData = [];

if (IS_PASSIVE) {
    var latestTime = process.hrtime();
    client.subscribe("payload");
    client.on("message", function (topic, message) {
        console.log(message.toString());
        const diffTime = process.hrtime(latestTime);
        timeData.push((diffTime[0] * NS_PER_SEC + diffTime[1]) / NS_PER_MS);

        receiveCounter++;
        if (receiveCounter > 5000) {
            fs.writeFile(
                `data/mqtt-server-passive-${PAYLOAD_SIZE}.json`,
                JSON.stringify(timeData),
                async function (err) {
                    if (err) {
                        throw err;
                    }

                    console.log("Data dalam bentuk json telah di save!");
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                    process.exit();
                }
            );
        }

        latestTime = process.hrtime();
    });
} else {
    client.on("connect", function () {
        client.subscribe("payload", function (err) {
            if (err) {
                throw err;
            }

            while (sendCounter < 5000) {
                payloadString = generatePayload(PAYLOAD_SIZE);
                client.publish("payload", payloadString);
                sendCounter++;
                console.log("Sent : ", sendCounter);
            }
        });
    });

    client.subscribe("time")
    client.on("message", function (topic, message) {
        if (topic == "time") {
            message = Number(message.toString()) / uS_PER_MS;
            timeData.push(message);
    
            receiveCounter++;
            console.log("Received : ", receiveCounter);
    
            if (receiveCounter >= 5000) {
                fs.writeFile(
                    `data/mqtt-server-active-${PAYLOAD_SIZE}.json`,
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
        }
    });
}

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
