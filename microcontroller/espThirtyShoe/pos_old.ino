//double velocity[3] = {0, 0, 0};
//double position[3] = {0, 0, 0};
//double EMA_S[3] = {0, 0, 0};
//float EMA_a = 0.3;    //initialization of EMA alpha
/////definitely make sure that this is calibrated or something ^^^/////////////////////////////////////////////////////////////////
//
//bool stationary = true;
//
//
//
//void getPosition() {
//  integrateAccelerationToGet(velocity);   //returns velocity
//  highPassFilter(velocity);               //filters velocity
//  integrateVelocityToGet(position);       //returns position
//  highPassFilter(position);               //filters position
//  updatePosition();
//}
//
//void highPassFilter(double *arr) {
//  for (int j = 0; j < 3; j++) {
//    EMA_S[j] = (EMA_a * arr[j]) + ((1 - EMA_a) * EMA_S[j]); //run the EMA
//    arr[j] = arr[j] - EMA_S[j];
//  }
//}
//
//void integrateAccelerationToGet(double *arr) {
//  arr[0] += sensor_data[LINEAR_ACCELEROMETER_X]  * 1000 * sampling_time;
//  arr[1] += sensor_data[LINEAR_ACCELEROMETER_Y]  * 1000 * sampling_time; //1000 because I want to have mm/s not m/s,
//  arr[2] += sensor_data[LINEAR_ACCELEROMETER_Z]  * 1000 * sampling_time; //sampling_time is the time between readings, which may not be correct! and is definitely not consistent??
//
//  Serial.print(arr[0]);
//  Serial.print("\t\t");
//  Serial.print(arr[1]);
//  Serial.print("\t\t");
//  Serial.print(arr[2]);
//  Serial.print("\t\t\t");
//}
//
//void integrateVelocityToGet(double *arr) {
//  arr[0] += velocity[0] * sampling_time;
//  arr[1] += velocity[1] * sampling_time; //not doing 1000 because I should already have it in the units i need
//  arr[2] += velocity[2] * sampling_time; //sampling_time is the time between readings, which may not be correct! and is definitely not consistent??
//
//  Serial.print(arr[0]);
//  Serial.print("\t\t");
//  Serial.print(arr[1]);
//  Serial.print("\t\t");
//  Serial.print(arr[2]);
//  Serial.println();
//}
//
//void updatePosition() {
//  sensor_data[POSITION_X] = position[0];
//  sensor_data[POSITION_Y] = position[1];
//  sensor_data[POSITION_Z] = position[2];
//}
//
//
////literal copy paste of magwick stuff
//
//
//// -------------------------------------------------------------------------
//// Detect stationary periods
//
//// Compute accelerometer magnitude
//float acc_mag = sqrt(accX.*accX + accY.*accY + accZ.*accZ);
//
//// HP filter accelerometer data
//float filtCutOff = 0.001;
//// convert this to new filter///////////////////////////////////////////////
//[b, a] = butter(1, (2*filtCutOff)/(1/samplePeriod), 'high');
//acc_magFilt = filtfilt(b, a, acc_mag);
//////////////////////////////////////////////////////////////////////////////
//
//// Compute absolute value
//float acc_magFilt = abs(acc_magFilt);
//
//// LP filter accelerometer data
//filtCutOff = 5;
//// convert this to new filter///////////////////////////////////////////////
//[b, a] = butter(1, (2*filtCutOff)/(1/samplePeriod), 'low');
//acc_magFilt = filtfilt(b, a, acc_magFilt);
//////////////////////////////////////////////////////////////////////////////
//
//// Threshold detection
//stationary = acc_magFilt < 0.05;
//
//// -------------------------------------------------------------------------
//// Compute translational velocities
//
//acc(:,3) = acc(:,3) - 9.81;
//
//// Integrate acceleration to yield velocity
//vel = zeros(size(acc));
//for (t = 2:length(vel)) {
//    vel(t,:) = vel(t-1,:) + acc(t,:) * samplePeriod;
//    if (stationary(t) == 1) {
//        vel(t,:) = [0 0 0];     // force zero velocity when foot stationary
//    }
//}
//
//
//// Compute integral drift during non-stationary periods
//velDrift = zeros(size(vel));
//stationaryStart = find([0; diff(stationary)] == -1);
//stationaryEnd = find([0; diff(stationary)] == 1);
//for (i = 1:numel(stationaryEnd)) {
//    driftRate = vel(stationaryEnd(i)-1, :) / (stationaryEnd(i) - stationaryStart(i));
//    enum = 1:(stationaryEnd(i) - stationaryStart(i));
//    drift = [enum'*driftRate(1) enum'*driftRate(2) enum'*driftRate(3)];
//    velDrift(stationaryStart(i):stationaryEnd(i)-1, :) = drift;
//}
//
//// Remove integral drift
//vel = vel - velDrift;
//
//// -------------------------------------------------------------------------
//// Compute translational position
//
//// Integrate velocity to yield position
//pos = zeros(size(vel));
//for t = 2:length(pos)
//    pos(t,:) = pos(t-1,:) + vel(t,:) * samplePeriod;    // integrate velocity to yield position
//end
//// -------------------------------------------------------------------------
