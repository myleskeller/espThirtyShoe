void setupWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  webSerial.println("");
  webSerial.print("Connecting to Wifi");

  // Wait for connection
  changeModeLED(PULSE);
  while (WiFi.status() != WL_CONNECTED) {
    updateLED();
    delay(500);
    webSerial.print(".");
  }
  changeModeLED(FAST_PULSE);


  webSerial.println("");
  webSerial.printf("Connected to '%s'\r\n\r\n", ssid);

  String ipaddr = ip2string(WiFi.localIP());
  webSerial.printf("IP address   : %s\r\n", ipaddr.c_str());
  webSerial.printf("MAC address  : %s \r\n", WiFi.macAddress().c_str());
}

String ip2string(IPAddress ip) {
  String ret = String(ip[0]) + "." +  String(ip[1]) + "." + String(ip[2]) + "." + String(ip[3]);
  return ret;
}
