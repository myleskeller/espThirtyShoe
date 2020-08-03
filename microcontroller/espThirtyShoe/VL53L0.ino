#include <VL53L0X.h>
#define LOX1_ADDRESS 0x30
#define LOX2_ADDRESS 0x31
// set the pins to shutdown
#define SHT_LOX1 33
#define SHT_LOX2 23

#define ERROR_VAL -1

VL53L0X sensor;
VL53L0X sensor2;

// Uncomment this line to use long range mode. This
// increases the sensitivity of the sensor and extends its
// potential range, but increases the likelihood of getting
// an inaccurate reading because of reflections from objects
// other than the intended target. It works best in dark
// conditions.

//#define LONG_RANGE

// Uncomment ONE of these two lines to get
// - higher speed at the cost of lower accuracy OR
// - higher accuracy at the cost of lower speed

#define HIGH_SPEED
//#define HIGH_ACCURACY

void checkVL53L0() {
  if (sensor.timeoutOccurred()) { //if this is time-consuming, remove it
    Serial.print("Distance 2 TIMEOUT");
    sensor_data[DISTANCE_L] = ERROR_VAL;
  }
  else {
    sensor_data[DISTANCE_L] = sensor.readRangeSingleMillimeters();
  }

  if (sensor2.timeoutOccurred()) { //if this is time-consuming, remove it
    Serial.println("Distance 2 TIMEOUT");
    sensor_data[DISTANCE_R] = ERROR_VAL;
  }
  else {
    sensor_data[DISTANCE_R] = sensor2.readRangeSingleMillimeters();
  }
}

bool setupVL53L0() {
  delay(100);
  bool status;

  sensor.setTimeout(SENSOR_POLL_INTERVAL);
  sensor2.setTimeout(SENSOR_POLL_INTERVAL);

  pinMode(SHT_LOX1, OUTPUT);
  pinMode(SHT_LOX2, OUTPUT);
  // shutdown pins inited
  digitalWrite(SHT_LOX1, LOW);
  digitalWrite(SHT_LOX2, LOW);
  //  Both in reset mode
  digitalWrite(SHT_LOX1, LOW);
  digitalWrite(SHT_LOX2, LOW);
  delay(10);
  // all unreset
  digitalWrite(SHT_LOX1, HIGH);
  digitalWrite(SHT_LOX2, HIGH);
  delay(10);
  // activating LOX1 and reseting LOX2
  digitalWrite(SHT_LOX1, HIGH);
  digitalWrite(SHT_LOX2, LOW);

  sensor.setAddress(LOX1_ADDRESS);
  if (!sensor.init()) {
    webSerial.println("VL53L0 Sensor 1 Failed");
    Serial.println("VL53L0 Sensor 1 Failed");

    status = false;
  }
  else {
    webSerial.println("VL53L0 Sensor 1 Enabled");
    Serial.println("VL53L0 Sensor 1 Enabled");
    status = true;
  }

  delay(10);
  // activating LOX2
  digitalWrite(SHT_LOX2, HIGH);
  delay(10);

  sensor2.setAddress(LOX2_ADDRESS);
  if (!sensor2.init()) {
    webSerial.println("VL53L0 Sensor 2 Failed");
    Serial.println("VL53L0 Sensor 2 Failed");
    status = false;
  }
  else {
    webSerial.println("VL53L0 Sensor 2 Enabled");
    Serial.println("VL53L0 Sensor 2 Enabled");
    status = true;
  }

#if defined LONG_RANGE
  // lower the return signal rate limit (default is 0.25 MCPS)
  sensor.setSignalRateLimit(0.1);
  // increase laser pulse periods (defaults are 14 and 10 PCLKs)
  sensor.setVcselPulsePeriod(VL53L0X::VcselPeriodPreRange, 18);
  sensor.setVcselPulsePeriod(VL53L0X::VcselPeriodFinalRange, 14);

  sensor2.setSignalRateLimit(0.1);
  // increase laser pulse periods (defaults are 14 and 10 PCLKs)
  sensor2.setVcselPulsePeriod(VL53L0X::VcselPeriodPreRange, 18);
  sensor2.setVcselPulsePeriod(VL53L0X::VcselPeriodFinalRange, 14);
#endif

#if defined HIGH_SPEED
  // reduce timing budget to 20 ms (default is about 33 ms)
  sensor.setMeasurementTimingBudget(20000);
  sensor2.setMeasurementTimingBudget(20000);
#elif defined HIGH_ACCURACY
  // increase timing budget to 200 ms
  sensor.setMeasurementTimingBudget(200000);
  sensor2.setMeasurementTimingBudget(200000);
#endif

  return status;
}
