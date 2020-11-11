void setupWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.println("");
  Serial.print("Connecting to Wifi");

  // Wait for connection
  changeModeLED(PULSE);
  while (WiFi.status() != WL_CONNECTED) {
    updateLED();
    delay(500);
    Serial.print(".");
  }
  changeModeLED(FAST_PULSE);


  Serial.println("");
  Serial.printf("Connected to '%s'\r\n\r\n", ssid);

  String ipaddr = ip2string(WiFi.localIP());
  webSerial.printf("IP address   : %s\r\n", ipaddr.c_str());
  webSerial.printf("MAC address  : %s \r\n", WiFi.macAddress().c_str());
  Serial.printf("IP address   : %s\r\n", ipaddr.c_str());
  Serial.printf("MAC address  : %s \r\n", WiFi.macAddress().c_str());
}

String ip2string(IPAddress ip) {
  String ret = String(ip[0]) + "." +  String(ip[1]) + "." + String(ip[2]) + "." + String(ip[3]);
  return ret;
}
