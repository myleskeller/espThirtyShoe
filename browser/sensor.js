class sensor {
    constructor(index, type = '', unit = '', limits = [0, Infinity], precision = 0.00, location = [0, 0, 0]) {
        this.index = index;
        this.name = indices.keys(index);
        this.min = limits[0];
        this.max = limits[1];
        this.type = type;
        this.unit = unit;
        this.precision = precision;
        this.location = location;
        this.attachment = false;
        this.mesh = null;

        this.value = 0;
        this.value_old = 0;
    }

    attachTo(object) {
        scene.getObjectByName(object).attach(this.mesh);
    }

    updateGraphics() {
        if (page_visible) { //TODO move this to master call of updateGraphics
            var render_needed = false;

            if (this.value_old != this.value) {
                render_needed = true;

                if (this.type == "rotation_vector") {
                    updateAttitude(this.mesh);
                }

                else if (this.type == "linear_acceleration") {
                    if (motion_translation == true) {
                        updatePosition(this.mesh);
                    }
                }

                else if (this.type == "euler_vector") {
                    updateOrientation(this.mesh);
                }

                else if (this.type == "gravity_vector") {
                    updateGeometry(this.mesh);
                }

                else if (this.type == "distance") {
                    this.mesh.scale.z = current_scale * (this.value / this.max);
                    this.mesh.updateMatrix();
                }
            }

            //TODO move this to master call of updateGraphics
            //!if (render_needed) 
            //!    render();
        }
    }

    validateOutput() {
        if (this.type == "movement_classification") {
            switch (message_array[index]) {
                case 1:
                    output = "Motionless";
                    break;
                case 3:
                    output = "Stable";
                    break;
                case 4:
                    output = "Moving";
                    break;
                case 2:
                default:
                    console.log("error validating " + name + " with returned value " + output + '.');
                    break;
            }
        }

        else if (accuracy in this.type) { //? is this the right syntax?
            switch (message_array[index]) {
                case 0:
                    output = "Unreliable";
                    break;
                case 1:
                    output = "Low";
                    break;
                case 2:
                    output = "Medium";
                    break;
                case 3:
                    output = "High";
                    break;
                default:
                    console.log("error validating " + name + " with returned value " + output + '.');
                    break;
            }
        }

        else if (this.type == "distance") {
            var distance_new = message_array[index];
            if (distance_new > this.max || distance_new < this.min) {
                output = Number.NaN;
            } else {
                output = distance_new;
            }
        }

        this.value_old = this.value;
        this.value = output;
    }
}