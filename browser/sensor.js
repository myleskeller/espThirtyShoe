//TODO change index to be dynamically allocated instead of hard-coded
//TODO sensors get super-butthurt when you don't initialize them with an index value.
// sensors.push(new Gravity({
// location: [0, 0, 0]
// }));
// sensors.push(new Step());
// console.log(sensors);

class Sensor {
    constructor(input) {
        this.index = input.index;
        if (input.name) this.name = input.name;
        if (input.duty_cycle) {
            // console.log(input.duty_cycle.reference_sensor_index)
            // if (Number.isInteger(input.duty_cycle.reference_sensor_index)) {
            // console.log("index present")
            this.assignDutyCycle(input.duty_cycle);
            // } else {
            //     this.assignDutyCycle(input.duty_cycle.functions, input.duty_cycle.domains, input.duty_cycle.reference_sensor_id);
            // }
            this.isModulated = true;
        }
        // if (input.frequency) this.assignFrequency(input.frequency);
        // else {
            this.frequency;
            this.frequency_old;
        // }

        // this.name = this.assignName(input.name);
        this.accuracy = this.assignAccuracy(input.accuracy);
        this.limits = this.assignExtrema(input.limits);

        this.type = input.type;
        this.unit = input.unit;
        this.precision = input.precision;
        this.location = input.location;
        this.mesh = null;
        this.icon = input.icon;
        this.visible = true; //? redundant to 'isRendered'?
        this.value;
        this.value_old;
        this.parent_node;
        this.parent_microcontroller;
        this.reference_sensor;
        this.reference_sensor_index;
        this.isGraphed = input.isGraphed;
        this.isRendered = input.isRendered;
        this.color = "#808080";


        if (Array.isArray(this.index)) {
            this.value = [];
            this.value_old = [];
            for (var i = 0; i < this.index.length; i++) {
                this.value[i] = 0;
                this.value_old[i] = 0;
            }
        }
        else {
            this.value = 0;
            this.value_old = 0;
        }
    }

    attachTo(object) {
        scene.getObjectByName(object).attach(this.mesh);
    }

    updateGraphics() {
        //only here to prevent errors since not all sensors can be rendered in 3D
    }


    updateDutyCycle() { //* assert( formulas[].length == domains[].length )
        if (this.isModulated) {
            //default callback that does nothing.
            //limit support to:
            //  proportional 
            //  piecewise-linear
            //  "custom"
            // rip programmer

            // accel. and light sensor
            // only sample light if accel is... [3 ranges];
            // time windnow t, ...
            // callback type (proportional/piecewise
            //piecewise
            // array[3] -> bounds of range -> [0.5,1,2]
            // proportional:
            // y=alpha(X)+c
            // would need an update loop (probably validateInput())
            // sending alpha, c
            // alpha = porportionality factor
            // c = offset 

            // this.duty_cycle = Piecewise(formulas, domains);
            // this.duty_cycle = (reference_sensor_id.value);
            this.frequency_old = this.frequency;


            var xs = this.duty_cycle.formulas;
            var ys = this.duty_cycle.domains;
            // console.log("well?" + this.duty_cycle.reference_sensor_index)
            if (Number.isInteger(this.duty_cycle.reference_sensor_index)) {
                // console.log(this.duty_cycle)
                var x = platform.sensors[getSensorIndexByID(this.duty_cycle.reference_sensor_id)].value[this.duty_cycle.reference_sensor_index];
            }
            else if (this.duty_cycle.reference_sensor_index == "raw") {
                var x = platform.sensors[getSensorIndexByID(this.duty_cycle.reference_sensor_id)].value_raw;
            }
            else
                var x = platform.sensors[getSensorIndexByID(this.duty_cycle.reference_sensor_id)].value;
            //bisect
            var lo = 0, hi = xs.length - 1;
            while (hi - lo > 1) {
                var mid = (lo + hi) >> 1;
                if (x < xs[mid]) hi = mid;
                else lo = mid;
            }
            //project
            this.frequency = ys[lo] + (ys[hi] - ys[lo]) / (xs[hi] - xs[lo]) * (x - xs[lo]);

            // console.log("frequency changed to " + this.frequency + " because " + this.duty_cycle.reference_sensor_id + "[" + this.duty_cycle.reference_sensor_index + "] was " + platform.sensors[getSensorIndexByID(this.duty_cycle.reference_sensor_id)].value[this.duty_cycle.reference_sensor_index]);

            // this.frequency = this.duty_cycle; // should not have parentheses.
            // console.log(this.frequency);
            if (this.frequency != this.frequency_old) {
                // assignFrequency(this.frequency)//TODO can't use this yet because WS isn't loaded asoon enough
                //* byte telling uC we want to update specific sensor polling rate
                var message = "*";
                //* byte telling uC which sensor
                if (Array.isArray(this.index))
                    message += this.index[0];
                else
                    message += this.index;
                connection.send(message);
                console.log(message);

                message = ">";
                //* byte telling uC what to set the polling rate to
                message += Math.round(this.frequency);
                connection.send(message);
                console.log(message);
            }
        }
    }

    assignFrequency(frequency) {
        this.frequency = frequency;
        //* byte telling uC we want to update specific sensor polling rate
        var message = "*";
        //* byte telling uC which sensor
        if (Array.isArray(this.index))
            message += this.index[0];
        else
            message += this.index;
        connection.send(message);
        console.log(message);

        message = ">";
        //* byte telling uC what to set the polling rate to
        message += Math.round(frequency);
        connection.send(message);
        console.log(message);
    }

    assignDutyCycle(duty_cycle) { //formulas, domains, reference_sensor_id, reference_sensor_index) { //* assert( formulas[].length == domains[].length )
        this.duty_cycle = duty_cycle;
        // this.duty_cycle.domains = domains;
        // this.duty_cycle.reference_sensor = reference_sensor_id;
        // this.duty_cycle.reference_sensor_index = reference_sensor_index;
        // console.log("DUTY CYCLE " + this.duty_cycle)

        // this.reference_sensor = reference_sensor_id;
        // // console.log(this.reference_sensor) //correct
        // if (Number.isInteger(reference_sensor_index))
        //     this.reference_sensor_index = reference_sensor_index;

        // // function Piecewise(xs, ys) {
        // this.duty_cycle = function () {
        //     var xs = formulas;
        //     var ys = domains;
        //     if (Number.isInteger(this.reference_sensor_index)) {
        //         this.reference_sensor_index = reference_sensor_index;
        //         var x = platform.sensors[getSensorIndexByID(this.reference_sensor)].value[this.reference_sensor_index];
        //     }
        //     else
        //         var x = platform.sensors[getSensorIndexByID(this.reference_sensor)].value;
        //     //bisect
        //     var lo = 0, hi = xs.length - 1;
        //     while (hi - lo > 1) {
        //         var mid = (lo + hi) >> 1;
        //         if (x < xs[mid]) hi = mid;
        //         else lo = mid;
        //     }
        //     //project
        //     return ys[lo] + (ys[hi] - ys[lo]) / (xs[hi] - xs[lo]) * (x - xs[lo]);
        // };
        // // }
        // // console.log(reference_sensor_index) //correct

        // this.frequency = this.duty_cycle(reference_sensor_id);
        // // console.log(this.frequency) //correct

        // console.log("frequency changed to " + this.frequency + " because " + this.reference_sensor + "[" + this.reference_sensor_index + "] was " + platform.sensors[getSensorIndexByID(this.reference_sensor)].value[this.reference_sensor_index]);
    }

    updateValue() {
        var output;
        if (this.limits) { //* if there are extrema limits set
            if (Array.isArray(this.index)) {
                output = [];

                for (var i = 0; i < this.index.length; i++) {
                    var value_new = message_array[parseInt(this.index + i)];

                    if (value_new > this.limits.max || value_new < this.limits.min) { //? will this work in this context?
                        output[i] = Number.NaN;
                    } else {
                        output[i] = value_new;
                    }
                }
            }
            else {
                output = message_array[this.index];
            }
        }
        else { //* if there are NO extrema limits 
            if (Array.isArray(this.index)) {
                output = [];
                //! if you are having a problem with all values being the same, it's probably here
                for (i = 0; i < this.index.length; i++) {
                    output[i] = message_array[parseInt(this.index[i])];
                }
            }
            else {
                output = message_array[this.index];
            }
        }
        //* cycling in new values
        if (Array.isArray(this.index)) {
            if (this.accuracy) {//* if this sensor has an accuracy classifier 
                var j;
                for (j = 0; j < this.index.length - 1; j++) {
                    this.value_old[j] = this.value[j];
                    this.value[j] = output[j];
                }
                this.value_old[j] = this.value[j];
                this.value[j] = this.dictionary[output[j]];
            }
            else {
                for (i = 0; i < this.index.length; i++) {
                    this.value_old[i] = this.value[i];
                    this.value[i] = output[i];
                }
            }
        }
        else {
            this.value_old = this.value;
            this.value = output;
        }
    }

    updateUIValue() {
        if (Array.isArray(this.index)) {
            for (i = 0; i < this.index.length; i++) {
                document.getElementById("item_" + this.name + i).innerText = this.value[i]; //TODO these references can be updated to use the new IDs
            }
        }
        else {
            document.getElementById("item_" + this.name).innerText = this.value;
        }
    }

    toggleVisibility() {
        if (this.visible == false) {
            this.visible = true;
            if (this.mesh)
                this.mesh.visible = true;
        }
        else {
            this.visible = false;
            if (this.mesh)
                this.mesh.visible = false;
        }
    }

    assignAccuracy(dictionary) {
        if (dictionary) {
            //* assign last index value to accuracy parameter
            this.dictionary = dictionary;
            return true;
        }
        return false;
    }

    assignExtrema(limits) {
        var _limits;
        if (limits) {
            _limits = {
                min: limits[0],
                max: limits[1]
            };
            return _limits;
        }
        return limits;
    }
}

class VectorSensor extends Sensor {
    constructor(input) {
        super(input);
        if (!this.icon) this.icon = "axis-arrow";
    }
}

class OrientationSensor extends Sensor {
    constructor(input) {
        super(input);
        if (!this.icon) this.icon = "rotate-orbit";
    }
}

class Classifier extends Sensor {
    constructor(input) {
        super(input);
        if (!this.icon) this.icon = "shape-outline";
        this.dictionary = input.dictionary;
        this.value_raw;
    }
    updateValue() {
        this.value_old = this.value;
        this.value = this.dictionary[message_array[this.index]];
        this.value_raw = message_array[this.index];
    }
}

class Steps extends Sensor {
    constructor(input) {
        super(input);
        if (!this.icon) this.icon = "shoe-print";
        this.limits.min = 0;
    }
}

class Distance extends Sensor {
    constructor(input) {
        super(input);
        if (!this.icon) this.icon = "ruler";
        this.orientation = input.orientation;
    }
    // updateGraphics() {
    //     if (this.visible == true) {
    //         if (this.value_old != this.value) {
    //             this.mesh.scale.z = current_scale * (this.value / this.max); //TODO probably need to figure out how to make axes more universal.
    //             this.mesh.updateMatrix();
    //             return true;
    //         }
    //     }
    //     return false;
    // }

    //! band-aid 
    updateGraphics() {
        if (this.visible == true) {
            if (this.value_old != this.value) {
                if (this.id == "uC0_DISTANCE")
                    var name = "lineL";
                else if (this.id == "uC0_DISTANCE1")
                    var name = "lineR";
                var line = scene.getObjectByName("shoe").getObjectByName(name);
                // console.log(line)
                // line.mesh.scale.z = current_scale * (this.value / this.max);
                line.scale.z = current_scale * (this.value / this.limits.max);
                // console.log(line.scale.z)
                // console.log(this.max)
                line.updateMatrix();
                return true;
            }
        }
        return false;
    }
}

class Accelerometer extends VectorSensor { //* probably not useful to render since it's not factoring out gravity.
    constructor(input) {
        super(input);
    }

    // updateGraphics() {
    //     if (this.visible == true) {
    //         if (this.value_old != this.value) {
    //             if (motion_translation == true)
    //                 updatePosition(this.mesh);
    //             return true;
    //         }
    //     }
    //     return false;
    // }
}

class LinearAccelerometer extends Accelerometer {
    constructor(input) {
        super(input);
    }
}

class Gyroscope extends OrientationSensor {
    constructor(input) {
        super(input);
    }
}

class Magnometer extends OrientationSensor {
    constructor(input) {
        super(input);
        if (!this.icon) this.icon = "compass-outline";
    }
}

class Quaternion extends VectorSensor {
    constructor(input) {
        super(input);
    }
    // updateGraphics() {
    //     if (this.visible == true) {
    //         if (this.value_old != this.value) {
    //             updateAttitude(this.mesh);
    //             return true;
    //         }
    //     }
    //     return false;
    // }
}

class Euler extends VectorSensor {
    constructor(input) {
        super(input);
    }
    updateGraphics() {
        //! band-aid
        updateOrientation(scene.getObjectByName("shoe"), this.value);
        // if (this.visible == true) {
        //     if (this.value_old != this.value) {
        //         updateOrientation(this.mesh);
        //         return true;
        //     }
        // }
        // return false;
    }
}

class Gravity extends VectorSensor {
    constructor(input) {
        super(input);
        if (!this.icon) this.icon = "earth";
    }
    updateGraphics() {
        if (this.visible == true) {
            if (this.value_old != this.value) {
                // updateGeometry(this.mesh); //corect implimentation
                updateGeometry(scene.getObjectByName("gravity"));

                return true;
            }
        }
        return false;
    }
}