#include <ESP8266WiFi.h>
#include <PubSubClient.h>

const char* ssid = "Berment";
const char* password = "69123028";
const char* mqtt_server = "192.168.0.12";

WiFiClient espClient;
PubSubClient client(espClient);

bool isPassive = true;
unsigned long diffTime;
unsigned long latestTime = micros();

void setup_wifi() {
  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  randomSeed(micros());

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void passiveCallback(char* topic, byte* payload, unsigned int length) {
//  Serial.println(String((char *)payload));
  diffTime = micros() - latestTime;
  client.publish("time", String(diffTime).c_str());
  latestTime = micros();
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      client.subscribe("payload");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
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
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);  
  client.setCallback(passiveCallback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.subscribe("payload");
  client.loop();

  if (!isPassive) {
    String payload = generatePayload(400);
    
//    unsigned long startTime = micros();
    client.publish("payload", payload.c_str());
    
//    unsigned long endTime = micros();
  
//    unsigned long totalTime = endTime - startTime;
      Serial.printf("Mengirim pesan: %s \n", payload.c_str());
  }
}
