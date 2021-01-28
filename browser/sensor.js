class Sensor {
    constructor(input) {
        this.index = input.index;
        this.name = this.assignName(input.name);
        this.accuracy = this.assignAccuracy(input.accuracy);
        this.limits = this.assignExtrema(input.limits);
        this.type = input.type;
        this.unit = input.unit;
        this.precision = input.precision;
        this.location = input.location;
        this.mesh = null;
        this.icon = input.icon;
        this.visible = true;
        this.value;
        this.value_old;

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

    validateOutput() {
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
                document.getElementById("item_" + this.name + i).innerText = this.value[i];
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

    assignName(_name) {
        //* if a name wasn't provided, generate one procedurally
        if (!_name) {
            if (Array.isArray(this.index)) {
                _name = Object.keys(indices)[this.index[0]].split('_')[0];
            }
            else {
                _name = Object.keys(indices)[this.index].split('_')[0];
            }
        }

        //* checks if name already exists in array and appends to avoid conflicts
        var duplicate_found = sensors.find(x => x.name == _name);
        if (duplicate_found != undefined) { //if DISTANCE(x) exists, replace with DISTANCE(x+1)
            var num = parseInt(duplicate_found.name.charAt(duplicate_found.name.length - 1)); //integer at the end of duplicate sensor
            if (!num)
                num = 1;
            else
                num++;
            _name = _name + num;
        }
        return _name;
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
    }
    validateOutput() {
        this.value_old = this.value;
        this.value = this.dictionary[message_array[this.index]];
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
    updateGraphics() {
        if (this.visible == true) {
            if (this.value_old != this.value) {
                this.mesh.scale.z = current_scale * (this.value / this.max); //TODO probably need to figure out how to make axes more universal.
                this.mesh.updateMatrix();
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

    updateGraphics() {
        if (this.visible == true) {
            if (this.value_old != this.value) {
                if (motion_translation == true)
                    updatePosition(this.mesh);
                return true;
            }
        }
        return false;
    }
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
    updateGraphics() {
        if (this.visible == true) {
            if (this.value_old != this.value) {
                updateAttitude(this.mesh);
                return true;
            }
        }
        return false;
    }
}

class Euler extends VectorSensor {
    constructor(input) {
        super(input);
    }
    updateGraphics() {
        if (this.visible == true) {
            if (this.value_old != this.value) {
                updateOrientation(this.mesh);
                return true;
            }
        }
        return false;
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
                updateGeometry(this.mesh);
                return true;
            }
        }
        return false;
    }
}