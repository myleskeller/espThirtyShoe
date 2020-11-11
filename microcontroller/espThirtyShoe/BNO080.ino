#define LED_ENABLED

BNO080 myIMU;
//i think the default address is 0x4B
unsigned long last_measured;
float sampling_time;


bool setupBNO080() {
  delay(100);
  bool status;
  if (myIMU.begin() == false) {
    webSerial.println("BNO080 Sensor Failed");
    Serial.println("BNO080 Sensor Failed");
    status = false;
  }
  else {
    webSerial.println("BNO080 Sensor Enabled");
    Serial.println("BNO080 Sensor Enabled");
    status = true;
  }
  //  myIMU.enableStepCounter(500);
  //  myIMU.enableAccelerometer(SENSOR_POLL_INTERVAL); //Send data update every 50ms
  //  myIMU.enableGyro(SENSOR_POLL_INTERVAL); //Send data update every 50ms
  //  myIMU.enableGyroIntegratedRotationVector(SENSOR_POLL_INTERVAL); //Send data update every 50ms
  //  myIMU.enableAccelerometer(SENSOR_POLL_INTERVAL); //Send data update every 50ms
  myIMU.enableRotationVector(SENSOR_POLL_INTERVAL); //Send data update every 50ms
  myIMU.enableLinearAccelerometer(SENSOR_POLL_INTERVAL); //Send data update every 50ms

  BNO080_status = status;
  return status;
}

bool imu_dataAvailable() {
  return myIMU.dataAvailable();
}

void checkBNO080() {
//  if (myIMU.dataAvailable() == true) {
    sensor_data[EULER_ROLL] = (myIMU.getRoll());
    sensor_data[EULER_PITCH] = (myIMU.getPitch());
    sensor_data[EULER_YAW] = (myIMU.getYaw());
    sensor_data[LINEAR_ACCELEROMETER_X] = myIMU.getLinAccelX();
    sensor_data[LINEAR_ACCELEROMETER_Y] =  myIMU.getLinAccelY();
    sensor_data[LINEAR_ACCELEROMETER_Z] =  myIMU.getLinAccelZ();
    unsigned long now = millis();
    sampling_time = (now - last_measured) / 1000.00;
    sensor_data[TIMESTAMP] = sampling_time*1000;
    last_measured = now;
//    computePosition();
//  integrate_acc(); //TEMPORARY
//  }
}
