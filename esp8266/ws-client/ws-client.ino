#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <WebSocketsClient.h>
#include <Hash.h>

ESP8266WiFiMulti WiFiMulti;
WebSocketsClient webSocket;
bool wsConnected;

bool isPassive = true;
unsigned long latestTime = micros();
unsigned long diffTime;
int loggingCount = 0;


void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      wsConnected = false;
      Serial.printf("[WSc] Disconnected!\n");
      break;
    case WStype_CONNECTED: {
      Serial.printf("[WSc] Connected to url: %s\n", payload);
      wsConnected = true;

      // send message to server when Connected
//      webSocket.sendTXT("[WSc] From arduino client");
    }
      break;
    case WStype_TEXT:
//      Serial.printf("[WSc] Received text: %s\n", payload);

      if (isPassive) {
        diffTime = micros() - latestTime;
        webSocket.sendTXT(String(diffTime).c_str());
        latestTime = micros();
      }
      
      break;
    case WStype_BIN:
      Serial.printf("[WSc] get binary length: %u\n", length);
      hexdump(payload, length);

      // send data to server
      // webSocket.sendBIN(payload, length);
      break;
    case WStype_PING:
        // pong will be send automatically
//        Serial.printf("[WSc] get ping\n");
        break;
    case WStype_PONG:
        // answer to a ping we send
//        Serial.printf("[WSc] get pong\n");
        break;
    }
}

String generatePayload(const int len) {
    static const char alphanum[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    String newPayload = "";
    
    for (int i = 0; i < len; ++i) {
        newPayload += alphanum[rand() % (sizeof(alphanum) - 1)];
    }

    return newPayload;
}

void setup() {
  // Serial.begin(921600);
  Serial.begin(115200);

  //Serial.setDebugOutput(true);
  Serial.setDebugOutput(true);

  Serial.println();
  Serial.println();
  Serial.println();

  for(uint8_t t = 4; t > 0; t--) {
    Serial.printf("[SETUP] BOOT WAIT %d...\n", t);
    Serial.flush();
    delay(1000);
  }

  WiFiMulti.addAP("Berment", "69123028");

  //WiFi.disconnect();
  while(WiFiMulti.run() != WL_CONNECTED) {
    delay(100);
  }

  // server address, port and URL
  webSocket.begin("192.168.0.12", 8080, "/");
  
  // event handler
  webSocket.onEvent(webSocketEvent);

  // try ever 5000 again if connection has failed
  webSocket.setReconnectInterval(5000);
  
  // start heartbeat (optional)
  // ping server every 15000 ms
  // expect pong from server within 3000 ms
  // consider connection disconnected if pong is not received 2 times
  webSocket.enableHeartbeat(15000, 3000, 2);

}

void loop() {
  webSocket.loop();
  
  if (wsConnected && !isPassive) {
    String payload = generatePayload(5);
        
//    unsigned long startTime = micros();
    webSocket.sendTXT(payload.c_str());
//    unsigned long endTime = micros();
  
//    unsigned long totalTime = endTime - startTime;
//    Serial.printf("Waktu kirim pesan: %lu \n", totalTime); 
  }
}
