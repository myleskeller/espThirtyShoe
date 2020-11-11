#include <VL53L0X.h>
#define LOX1_ADDRESS 0x30
#define LOX2_ADDRESS 0x31
// set the pins to shutdown
#define SHT_LOX1 33
#define SHT_LOX2 23
// set the pins for interrupt
#define INT_LOX1 2
#define INT_LOX2 27
//preset holders for different lighting conditions
#define VL53L0_LONG_RANGE                 1
#define VL53L0_NORMAL_RANGE               2
#define VL53L0_HIGH_SPEED                 3
#define VL53L0_HIGH_ACCURACY              4
#define VL53L0_NORMAL_SPEED_AND_ACCURACY  5

VL53L0X sensor;
VL53L0X sensor2;

uint16_t d1 = 0;
uint16_t d2 = 0;



void checkVL53L0() {
//  if (sensor_dataAvailable() == true)
    sensor_data[DISTANCE_L] = sensor_getDistance();
//  if (sensor2_dataAvailable() == true)
    sensor_data[DISTANCE_R] = sensor2_getDistance();
}

bool distance1_dataAvailable() {
  if (digitalRead(INT_LOX1) == LOW) {
    d1 = sensor.readReg16Bit(sensor.RESULT_RANGE_STATUS + 10);
    sensor.writeReg(sensor.SYSTEM_INTERRUPT_CLEAR, 0x01);
  }
}

bool distance2_dataAvailable() {
  if (digitalRead(INT_LOX1) == LOW) {
    d2 = sensor2.readReg16Bit(sensor2.RESULT_RANGE_STATUS + 10);
    sensor2.writeReg(sensor2.SYSTEM_INTERRUPT_CLEAR, 0x01);
  }
}

uint16_t sensor_getDistance() {
  return d1;
}
uint16_t sensor2_getDistance() {
  return d2;
}

bool setupVL53L0() {
  delay(100);
  bool status;

  sensor.setTimeout(SENSOR_POLL_INTERVAL * 10); //is this the same thing as the measurement period?
  sensor2.setTimeout(SENSOR_POLL_INTERVAL * 10); //is this the same thing as the measurement period?

  //set interrupt pins
  pinMode(INT_LOX1, INPUT);   //Interrupt pin on VL53L0X sensor
  pinMode(INT_LOX2, INPUT);   //Interrupt pin on VL53L0X sensor

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

  setVL53L0Mode(VL53L0_HIGH_SPEED); //33ms should work fine, no?

  sensor.startContinuous(SENSOR_POLL_INTERVAL);
  sensor2.startContinuous(SENSOR_POLL_INTERVAL);

  return status;
}

void setVL53L0Mode(uint8_t mode) {
  switch (mode) {
    case VL53L0_LONG_RANGE:
      sensor.setSignalRateLimit(0.1);
      sensor.setVcselPulsePeriod(VL53L0X::VcselPeriodPreRange, 18);
      sensor.setVcselPulsePeriod(VL53L0X::VcselPeriodFinalRange, 14);
      sensor2.setSignalRateLimit(0.1);
      sensor2.setVcselPulsePeriod(VL53L0X::VcselPeriodPreRange, 18);
      sensor2.setVcselPulsePeriod(VL53L0X::VcselPeriodFinalRange, 14);
      break;
    case VL53L0_NORMAL_RANGE:
      sensor.setSignalRateLimit(0.25);
      sensor.setVcselPulsePeriod(VL53L0X::VcselPeriodPreRange, 14);
      sensor.setVcselPulsePeriod(VL53L0X::VcselPeriodFinalRange, 10);
      sensor2.setSignalRateLimit(0.25);
      sensor2.setVcselPulsePeriod(VL53L0X::VcselPeriodPreRange, 14);
      sensor2.setVcselPulsePeriod(VL53L0X::VcselPeriodFinalRange, 10);
      break;

    case VL53L0_HIGH_SPEED:
        sensor.setMeasurementTimingBudget(20000);
      sensor2.setMeasurementTimingBudget(20000);
      break;
    case VL53L0_HIGH_ACCURACY:
      sensor.setMeasurementTimingBudget(200000);
      sensor2.setMeasurementTimingBudget(200000);
      break;
    case VL53L0_NORMAL_SPEED_AND_ACCURACY:
      sensor.setMeasurementTimingBudget(33000);
      sensor2.setMeasurementTimingBudget(33000);
      break;
  }
}
