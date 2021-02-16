
function initPlatform() {
    window.platform = new Platform();
}


//* simple platform class to get easier access to global variables
class Platform {
    constructor(input) {
        this.microcontrollers = [];
        this.sensors = [];
        // this.num_colors = 0;
        this.colors = [];

        if (input) {
            this.updateSensorList();
            // if (Array.isArray(input.microcontrollers)) {
            input.microcontrollers.forEach(microcontroller => {
                this.assignName(microcontroller);
                this.microcontrollers.push(microcontroller);
            });
            // } else {
            //     // this.microcontrollers.push(input.microcontrollers);
            // }
        }
    }

    assignColors() {
        var colors_needed = this.colors.length + 1;
        // console.log(colors_needed)
        this.colors = randomColor({ luminosity: 'bright', count: colors_needed });

        // console.log(this.sensors.length);
        for (var i = 0; i < this.sensors.length; i++) {
            this.sensors[i].color = this.colors[i];
            // console.log(this.sensors[i].color);
        }
        // console.log(this.colors)
    }

    assignName(microcontroller) {
        //* if a name wasn't provided, generate one procedurally
        if (!microcontroller.name) {
            microcontroller.name = microcontroller.constructor.name;
        }
        //* checks if name already exists in array and appends to avoid conflicts
        var duplicate_found = this.microcontrollers.find(x => x.name == microcontroller.name);
        if (duplicate_found != undefined) {
            var num = parseInt(duplicate_found.name.charAt(duplicate_found.name.length - 1));
            if (!num)
                num = 1;
            else
                num++;
            microcontroller.name = microcontroller.name + num;
            duplicate_found.name = duplicate_found.name + 0;
        }
    }

    addMicrocontroller(_microcontroller) { //! must be called AFTER sensors are added
        this.assignName(_microcontroller);
        this.microcontrollers.push(_microcontroller);
        this.updateSensorList();
    }

    addMicrocontrollers(_microcontrollers) { //! must be called AFTER sensors are added
        _microcontrollers.forEach(microcontroller => {
            this.assignName(microcontroller);
            this.microcontrollers.push(microcontroller);
            this.updateSensorList();
        });
    }

    updateSensorList() { //TODO update to check for ids instead of names
        this.microcontrollers.forEach(_microcontroller => {
            _microcontroller.sensors.forEach(_sensor => {
                this.sensors.push(_sensor);
            }, this);
        }, this);
    }
}

function getSensorIndexByName(name) {
    return platform.sensors.findIndex(x => x.name == name);
}
function getSensorIndexByID(id) {
    return platform.sensors.findIndex(x => x.id == id);
}
function getMicrocontrollerIndexByID(id) {
    return platform.microcontrollers.findIndex(x => x.id == id);
}
function getMicrocontrollerIndexByName(name) {
    return platform.microcontrollers.findIndex(x => x.name == name);
}