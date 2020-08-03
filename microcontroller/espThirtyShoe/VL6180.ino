//#define VL6180_INTEGRATION_PERIOD 5 //ms, based on paranoia, because i'm pretty sure it's handled internally
////#define NOISE_AVERAGE_PERIOD 5000 //ms
////#define ERROR_VAL -2
////#define OUT_OF_RANGE_VAL -1
//
//float VL6180_noise_average = 0, VL6180_hysteresis = 0, VL6180Lux = ERROR_VAL;
//int VL6180readings[ARRAY_BOUND];
//unsigned long VL6180iterations = 0;
//unsigned long VL6180start = 0;
//bool VL6180_range_error_detected = false, VL6180status;
//Adafruit_VL6180X vl = Adafruit_VL6180X();
//
//
//bool setupVL6180() {
//  if (! vl.begin()) {
//    webSerial.println("VL6180 Sensor Failed");
//    VL6180status = false;
//  }
//  else {
//    //    webSerial.println("VL6180 Sensor Enabled");
//    VL6180status = true;
//  }
//  return VL6180status;
//}
//
//int getVL6180NoiseAverage() {
//  setupVL6180ifNotAlready();
//
//  unsigned long end = NOISE_AVERAGE_PERIOD + millis();
//  unsigned long lastRefreshTime = 0;
//
//  while (millis() < end) {
//    readVL6180();
//    //    webSerial.print(readVL6180());
//    //    webSerial.print(',');
//    if (millis() - lastRefreshTime >= NOISE_AVERAGE_PERIOD / 5)  {
//      lastRefreshTime += NOISE_AVERAGE_PERIOD / 5;
//      // webSerial.print('.');
//    }
//  }
//  //  webSerial.println();
//
//  sort(VL6180readings, VL6180iterations);
//
//  int minimum = VL6180readings[0];
//  int maximum = VL6180readings[VL6180iterations - 1];
//
//  VL6180_noise_average = getVL6180Distance();
//
//  //  webSerial.print("Average: ");
//  //  webSerial.print(VL6180_noise_average);
//  //  webSerial.print(", hysteresis: ");
//  //  webSerial.println(maximum - minimum);
//
//  webSerial.print(VL6180_noise_average); webSerial.print(",\t");
//  if (VL6180_noise_average == OUT_OF_RANGE_VAL) {
//    maximum = 0;
//    minimum = 0;
//  }
//  webSerial.print(maximum - minimum); webSerial.print(",\t");
//
//  return (int)VL6180_noise_average;
//}
//
//
//int readVL6180() {
//  setupVL6180ifNotAlready();
//  if (millis() - VL6180start >= VL6180_INTEGRATION_PERIOD) { //if time since last readings >= 100ms
//    //  VL6180Lux =  vl.readLux(VL6180X_ALS_GAIN_5);
//    vl.readRange();
//    if (vl.readRangeStatus() == VL6180X_ERROR_NONE) {
//      toggleLED();
//      VL6180readings[VL6180iterations] = vl.readRange();
//      //    webSerial.println(vl.readRange());
//      VL6180start = millis(); //set timer to current time
//      VL6180iterations++;
//    }
//    else if (vl.readRangeStatus() != VL6180X_ERROR_NONE) {
//      VL6180readings[VL6180iterations] = OUT_OF_RANGE_VAL;
//      VL6180_range_error_detected = true;
//    }
//  }
//  return VL6180readings[VL6180iterations - 1];
//}
//
//int getVL6180Distance() {
//  setupVL6180ifNotAlready();
//
//  sort(VL6180readings, VL6180iterations);
//
//  unsigned long sum = 0;
//  for (int i = 0; i < VL6180iterations; i++) {
//    sum += VL6180readings[i];
//  }
//
//  if (VL6180iterations == 0) {//warn if no readings in array
//    //    webSerial.println("Not enough time given to take VL6180 readings.");
//    if (VL6180_range_error_detected) {
//      VL6180_range_error_detected = false;
//      return OUT_OF_RANGE_VAL;
//    }
//    else
//      return ERROR_VAL;
//  }
//  else {
//    float output = sum / VL6180iterations; //compute result
//    VL6180iterations = 0; //reset iteration counter
//    VL6180_range_error_detected = false;
//    return output;
//  }
//}
//
//float getVL6180Lux() { //if this works, you don't have an i2c issue.
//  setupVL6180ifNotAlready();
//  return vl.readLux(VL6180X_ALS_GAIN_5);
//  //  return VL6180Lux;
//}
//
//void displayError(uint8_t status) {
//  if  ((status >= VL6180X_ERROR_SYSERR_1) && (status <= VL6180X_ERROR_SYSERR_5))
//    webSerial.println("System error");
//  else if (status == VL6180X_ERROR_ECEFAIL)
//    webSerial.println("ECE failure");
//  else if (status == VL6180X_ERROR_NOCONVERGE)
//    webSerial.println("No convergence");
//  else if (status == VL6180X_ERROR_RANGEIGNORE)
//    webSerial.println("Ignoring range");
//  else if (status == VL6180X_ERROR_SNR)
//    webSerial.println("Signal/Noise error");
//  else if (status == VL6180X_ERROR_RAWUFLOW)
//    webSerial.println("Raw reading underflow");
//  else if (status == VL6180X_ERROR_RAWOFLOW)
//    webSerial.println("Raw reading overflow");
//  else if (status == VL6180X_ERROR_RANGEUFLOW)
//    webSerial.println("Range reading underflow");
//  else if (status == VL6180X_ERROR_RANGEOFLOW)
//    webSerial.println("Range reading overflow");
//}
//
//void setupVL6180ifNotAlready() {
//  if (VL6180status == false)
//    setupVL6180();
//}
