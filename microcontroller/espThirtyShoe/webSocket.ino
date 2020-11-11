bool connection_active = false;
unsigned long start = start = millis();
int send_rate = 0;

void setupWebSocket() {
  webSocket.begin();
  webSocket.onEvent(onWebSocketEvent);
  webSerial.println("WebSocket server started.");
  changeModeLED(FAST_PULSE);
}

void onWebSocketEvent(uint8_t client_num, WStype_t type, uint8_t * payload, size_t length) {
  updateLED();
  switch (type) {
    case WStype_DISCONNECTED:
      {
        connection_active = false;
        webSerial.printf("[%u] Disconnected!\n", client_num);
        changeModeLED(FAST_PULSE);
      }
      break;

    case WStype_CONNECTED:
      {
        connection_active = true;
        IPAddress ip = webSocket.remoteIP(client_num);
        webSerial.printf("[%u] Connection from ", client_num);
        webSerial.println(ip.toString());
        Serial.printf("[%u] Connection from ", client_num);
        Serial.println(ip.toString());
        changeModeLED(TOGGLE);
      }
      break;

    case WStype_TEXT:
      {
        webSerial.printf("[%u] get Text: %s\n", client_num, payload);
        switch (payload[0]) {
          case 'r':
            {
              send_rate = atoi((const char*)&payload[1]);
              Serial.print("send rate changed to:"); Serial.println(send_rate);
            }
            break;
          case 'f':
            {
              int temp = atoi((const char*)&payload[1]);
              HPfilterFrequency = temp / 1000.0;
              Serial.print("High-Pass filter alpha changed to:"); Serial.println(HPfilterFrequency);
            }
            break;
          case '!':
            {
              webSerial.println("Restarting ESP32.");
              Serial.println("Restarting ESP32.");
              delay(1000);
              ESP.restart();
            }
            break;
          case '?':
            {
              webSerial.println("");
              webSerial.printf("BNO080: %s", BNO080_status ? "true" : "false");
              webSerial.printf("VL53L0: % s", VL53L0_status ? "true" : "false");
              if (BNO080_status + VL53L0_status == 2)
                webSerial.println("all sensors seem operational.");
            }
            break;
          default:
            break;
        }
      }
      break;

    case WStype_BIN:
    case WStype_ERROR:
    case WStype_FRAGMENT_TEXT_START:
    case WStype_FRAGMENT_BIN_START:
    case WStype_FRAGMENT:
    case WStype_FRAGMENT_FIN:
    default:
      break;
  }
}

String concatenateSensorData() {
  String output = "";
  //  for (float val : sensor_data) {
  for (int i = 0; i < SENSOR_DATA_SIZE; i++) {
    if (i == DISTANCE_R || i == DISTANCE_L || TIMESTAMP)
      output = String(output + ", " + String(sensor_data[i]));
    else
      output = String(output + ", " + String(sensor_data[i], DECIMAL_PLACE));
  }
  //  webSerial.println(output);
  return output;
}

void sendSensorData() {
  //  webSerialled.println(millis() - start);
  if (connection_active && millis() - start >= send_rate) {
    webSocket.broadcastTXT(concatenateSensorData().c_str());
    start = millis();
  }
}
