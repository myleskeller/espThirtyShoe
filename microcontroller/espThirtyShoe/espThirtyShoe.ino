#define TOGGLE 3
#define FAST_PULSE 2
#define PULSE 1
#define OFF 0

#define WEBSOCKETS_NETWORK_TYPE NETWORK_ESP32
#include <ESPAsyncWebServer.h>
#include <WebSerial.h>
#include <WebSocketsServer.h>
#include <WiFi.h>
#include <Wire.h>
#include "SparkFun_BNO080_Arduino_Library.h"

#define SENSOR_DATA_SIZE          12
float sensor_data[SENSOR_DATA_SIZE];
#define LINEAR_ACCELEROMETER_X    0
#define LINEAR_ACCELEROMETER_Y    1
#define LINEAR_ACCELEROMETER_Z    2
#define POSITION_X                3
#define POSITION_Y                4
#define POSITION_Z                5
#define DISTANCE_R                6
#define DISTANCE_L                7
#define EULER_ROLL                8
#define EULER_PITCH               9
#define EULER_YAW                 10
#define TIMESTAMP                 11

#define DECIMAL_PLACE    6
#define SENSOR_POLL_INTERVAL 50

WebSocketsServer webSocket = WebSocketsServer(81);
const char *host = "espthirtyshoe";  // Used for MDNS resolution
const char *ssid = "Weylin";
const char *password = "Miso'sWhistle";

bool BNO080_status = false;
bool VL53L0_status = false;

void setup() {
  setupLED();
  btStop();
  Serial.begin(115200);
  webSerial.begin(&webSocket);
  setupWifi();
  setupWebSocket();
  Wire.begin();
  Wire.setClock(400000); //Increase I2C data rate to 400kHz
  VL53L0_status = setupVL53L0();
  BNO080_status = setupBNO080();
}

void loop() {
  webSocket.loop();
  updateLED();
  checkBNO080();
  checkVL53L0();
    Serial.print(sensor_data[LINEAR_ACCELEROMETER_X], 10); Serial.print(",");
    Serial.print(sensor_data[LINEAR_ACCELEROMETER_Y], 10); Serial.print(",");
    Serial.print(sensor_data[LINEAR_ACCELEROMETER_Z], 10);
    Serial.print("\t\t");
    Serial.print(sensor_data[DISTANCE_L]); Serial.print(",");
    Serial.println(sensor_data[DISTANCE_R]);
  sendSensorData();
}
