#include <Filters.h>
#define STATIONARY 1
#define MOVING 0

double velocity[3] = {0, 0, 0};
double position[3] = {0, 0, 0};
double drift[3] = {0, 0, 0};
bool new_state, old_state;
long counter;
//  threshold that determines if movement is noise or not
float stationaryThreshold = 0.05;
//  filters out changes faster that 5 Hz.
float LPfilterFrequency = 5.0;
float HPfilterFrequency = 0.001;
//  create filters
FilterOnePole lowpassFilter( LOWPASS, LPfilterFrequency );
FilterOnePole highpassFilter( HIGHPASS, HPfilterFrequency );

//  basically main
void getPosition() {
  integrateAccelerationToGet(velocity); //returns velocity
  if (!Stationary()) {
    compensateForDrift();
    integrateVelocityToGet(position); //returns position
    updatePosition();
    counter++; //QUESTION: does this need to be moved to beginning of a function call??
  }
  else {
    memset(velocity, 0, 3); // force zero velocity when foot is stationary
  }
}

// Detect state change from moving to stationary
bool StartedMoving() {
  if (old_state == STATIONARY && new_state == MOVING)  {
    return true;
  }
  else
    return false;
}

//basically just for debugging.
bool StoppedMoving() {
  if (old_state == MOVING && new_state == STATIONARY) {
    return true;
  }
  else
    return false;
}

// Detect stationary periods
bool Stationary() {
  old_state = new_state; //shift previous state

  // Compute accelerometer magnitude
  float acc_mag = sqrt(sensor_data[LINEAR_ACCELEROMETER_X] * sensor_data[LINEAR_ACCELEROMETER_X] + sensor_data[LINEAR_ACCELEROMETER_Y] * sensor_data[LINEAR_ACCELEROMETER_Y] + sensor_data[LINEAR_ACCELEROMETER_Z] * sensor_data[LINEAR_ACCELEROMETER_Z]);
  //HP filter accelerometer data
  acc_mag = highpassFilter.input(acc_mag);
  // Compute absolute value
  acc_mag = abs(acc_mag);
  // NOTE LP filter accelerometer data
  acc_mag = lowpassFilter.input(acc_mag);

  // NOTE Threshold detection
  if (acc_mag < stationaryThreshold) {
    new_state = STATIONARY;

    //basically just for debugging.
    if (StoppedMoving()) {
    }
    Serial.println("\nSTOPPED");
    sensor_data[MOVEMENT] = STATIONARY;
    return new_state;
  }
  else {
    new_state = MOVING;
    Serial.println("\nMOVING");
    sensor_data[MOVEMENT] = MOVING;

    //NOTE: after last vel collected -> non-stationary
    if (StartedMoving()) {
      counter = 1; //start counter for non-stationary
      //drift = last vel collected
      drift[0] = velocity[0];
      drift[1] = velocity[1];
      drift[2] = velocity[2];
    }
    return new_state;
  }
}

void integrateAccelerationToGet(double *arr) {
  arr[0] += sensor_data[LINEAR_ACCELEROMETER_X]  * 1000 * sampling_time;
  arr[1] += sensor_data[LINEAR_ACCELEROMETER_Y]  * 1000 * sampling_time;//1000 because I want to have mm/s not m/s,
  arr[2] += sensor_data[LINEAR_ACCELEROMETER_Z]  * 1000 * sampling_time;//sampling_time is the time between readings, which may not be correct! and is definitely not consistent??

  Serial.print('V');
  Serial.print("\t\t");
  Serial.print(arr[0]);
  Serial.print("\t\t");
  Serial.print(arr[1]);
  Serial.print("\t\t");
  Serial.print(arr[2]);
  Serial.print("\t\t\t");
}

// Compute integral drift during non-stationary periods
void compensateForDrift() {
  drift[0] = counter * drift[0];
  drift[1] = counter * drift[1];
  drift[2] = counter * drift[2];
  // NOTE: Remove integral drift
  velocity[0] = velocity[0] - drift[0];
  velocity[1] = velocity[1] - drift[1];
  velocity[2] = velocity[2] - drift[2];
}

// Compute translational position
void integrateVelocityToGet(double *arr) {
  arr[0] += velocity[0] * sampling_time;
  arr[1] += velocity[1] * sampling_time; //not doing 1000 because I should already have it in the units i need
  arr[2] += velocity[2] * sampling_time; //sampling_time is the time between readings, which may not be correct! and is definitely not consistent??

  Serial.print('P');
  Serial.print("\t\t");
  Serial.print(arr[0]);
  Serial.print("\t\t");
  Serial.print(arr[1]);
  Serial.print("\t\t");
  Serial.print(arr[2]);
  Serial.println();
}

void updatePosition() {
  sensor_data[POSITION_X] = position[0];
  sensor_data[POSITION_Y] = position[1];
  sensor_data[POSITION_Z] = position[2];
}
