#include <filters.h>
#define FILTER_CUTOFF    0.1
#define ARRAY_SIZE       4

float cutoff_freq = (2 * FILTER_CUTOFF) / (1 / sampling_time); //Cutoff frequency in Hz; may be wrong???
Filter f(cutoff_freq, sampling_time, IIR::ORDER::OD1, IIR::TYPE::HIGHPASS);

float old_acc[3], acc[3], old_vel[3], vel[3], pos[3];
void computePosition() {
  //  Serial.println(sampling_time);

  //  old_a=a;
  old_acc[0] = acc[0];
  old_acc[1] = acc[1];
  old_acc[2] = acc[2];

  //old_s=s;
  old_vel[0] = vel[0];
  old_vel[1] = vel[1];
  old_vel[2] = vel[2];

  //a=getAccelerationX();
  acc[0] = sensor_data[LINEAR_ACCELEROMETER_X];
  acc[1] = sensor_data[LINEAR_ACCELEROMETER_Y];
  acc[2] = sensor_data[LINEAR_ACCELEROMETER_Z];

  //  s = (old_a + a) * delta_t / 2.0;
  for (int i = 0; i < 3; i++) {
    vel[i] = (((old_acc[i] + acc[i]) * sampling_time) / 2.0);
  }

  // High-pass filter linear velocity to remove drift
  //  for (int j = 0; j < 3; j++) {
  //    vel[j] = f.filterIn(vel[j]);
  //  }

  //  x = (old_s + s) * delta_t / 2.0;
  for (int i = 0; i < 3; i++) {
    pos[i] = (((old_vel[i] + vel[i]) * sampling_time) / 2.0);
  }

  // High-pass filter linear position to remove drift
  //  for (int j = 0; j < 3; j++) {
  //    pos[j] = f.filterIn(pos[j]);
  //  }

  //set values
  sensor_data[POSITION_X] = pos[0];
  sensor_data[POSITION_Y] = pos[1];
  sensor_data[POSITION_Z] = pos[2];
}
