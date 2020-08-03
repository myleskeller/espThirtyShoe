#define led_freq 5000
#define led_channel 0
#define led_resolution 8
#define led_max_duty 32
#define LED_BUILTIN 19 //built-in led on TTGO T7

int led_mode = OFF;
int led_duty = OFF;
int pulse_speed_reduction = 4;
int led_pulse_max = led_max_duty * pulse_speed_reduction;
int led_brightness_reduction = 4;
bool rising = true;


void setupLED() {
#if defined LED_ENABLED
  ledcSetup(led_channel, led_freq, led_resolution);
  ledcAttachPin(LED_BUILTIN, led_channel);
  led_duty = OFF;
#endif
}

void changeModeLED(int mode) {
#if defined LED_ENABLED
  if (led_mode == OFF)
    setupLED();
  led_mode = mode;
#endif
}

void updateLED() {
#if defined LED_ENABLED
  switch (led_mode) {
    case OFF:
      disableLED();
      break;
    case PULSE:
      pulseLED();
      break;
    case FAST_PULSE:
      pulseFastLED();
      break;
    case TOGGLE:
      toggleLED();
      break;

  }
  //    webSerial.println(led_duty /  led_brightness_reduction);
#endif
}

void pulseLED() {
  if (rising == true) {
    if (led_duty >= led_pulse_max) {
      rising = false;
    }
    else {
      led_duty++;
      if (led_duty % pulse_speed_reduction == 0)
        ledcWrite(led_channel, (led_duty / pulse_speed_reduction) / led_brightness_reduction);
    }
  }
  else if (rising == false) {
    if (led_duty <= 0) {
      rising = true;
    }
    else {
      led_duty--;
      if (led_duty % pulse_speed_reduction == 0)
        ledcWrite(led_channel, (led_duty / pulse_speed_reduction) / led_brightness_reduction);
    }
  }
  delay(1); //esp32 too fast to reflect changes otherwise?
}

void pulseFastLED() {
  if (rising == true) {
    if (led_duty >= led_max_duty) {
      rising = false;
    }
    else {
      led_duty++;
      //        led_duty++;
      ledcWrite(led_channel, led_duty / led_brightness_reduction);
    }
  }
  else if (rising == false) {
    if (led_duty <= 0) {
      rising = true;
    }
    else {
      led_duty--;
      //        led_duty--;
      ledcWrite(led_channel, led_duty / led_brightness_reduction);
    }
  }
  //                webSerial.println(led_duty);
  delay(1); //esp32 too fast to reflect changes otherwise?
}

void toggleLED() {
  if (led_duty == OFF) {
    led_duty = led_max_duty;// / led_brightness_reduction;
    ledcWrite(led_channel, led_duty);// / led_brightness_reduction);
  }
  else {
    led_duty = OFF;
    ledcWrite(led_channel, OFF);
  }
  //    webSerial.print("LED:"); webSerial.println(led_duty / led_brightness_reduction);
}

void disableLED() {
  led_duty = OFF;
  ledcWrite(led_channel, led_duty);
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);
}
