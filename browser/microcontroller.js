class Microcontroller {
    constructor(input) {
        this.sensors = [];
        // this.name = this.assignName();
        if (input) {
            if (input.name) this.name = input.name;
            if (input.sensors) this.sensors = input.sensors;
            this.location = input.location;
            this.icon = input.icon;
        }
        
        platform.addMicrocontroller(this);
    }

    attachTo(object) {
        scene.getObjectByName(object).attach(this.mesh);
    }

    addSensor(sensor) {
        this.assignName(sensor);
        sensor.node_parent = this.name;
        this.assignID(sensor);
        platform.sensors.push(sensor);
        platform.assignColors();
    }

    addSensors(_sensors) {
        _sensors.forEach(sensor => {
            addSensor(sensor);
        });
    }

    getSensorIndexByName(sensor) {
        return platform.sensors.findIndex(x => x.name == sensor.name);
    }
    getSensorIndexByID(sensor) {
        return platform.sensors.findIndex(x => x.id == sensor.id);
    }
    //* id = "[node_name]+[sensor_name]"
    assignID(sensor) {
        sensor.id = sensor.node_parent + '_' + sensor.name; //* appends parent node to front of name.

        //* checks if name already exists in array and appends to avoid conflicts (shouldn't happen)
        var duplicate_found = this.getSensorIndexByID(sensor).id;
        if (duplicate_found) {
            var sensor_name = platform.sensors[duplicate_found];
            var num = parseInt(sensor_name.charAt(sensor_name.length - 1)); //append integer at the end of duplicate
            if (!num)
                num = 1;
            else
                num++;
            sensor.id = sensor.id + num;
        }
    }
    //* name = "[sensor_name][necessary appended #]"
    assignName(sensor) {
        //* if a name wasn't provided, generate one procedurally
        if (!sensor.name) {
            if (Array.isArray(sensor.index)) {
                sensor.name = Object.keys(indices)[sensor.index[0]].split('_')[0];
            }
            else {
                sensor.name = Object.keys(indices)[sensor.index].split('_')[0];
            }
        }

        //* checks if name already exists in array and appends to avoid conflicts
        var duplicate_found = platform.sensors[this.getSensorIndexByName(sensor)];
        // console.log(duplicate_found)
        if (duplicate_found) {
            var sensor_name = duplicate_found.name;
            var num = parseInt(sensor_name.charAt(sensor_name.length - 1)); //append integer at the end of duplicate
            if (!num)
                num = 1;
            else
                num++;
            sensor.name = sensor.name + num;
            duplicate_found.name = duplicate_found.name + 0;
        }
    }
}

class Controller extends Microcontroller {
    constructor(input) {
        super(input);
        if (input) {
            if (!input.icon) this.icon = "hubspot";
            if (input.nodes)
                this.nodes = input.nodes; //holds nodes that report to this particular microcontroller
            //* should address the single controller scenario by automatically creating node object
            else {
                var node = new Node();
                this.nodes = node;
            }
        }
    }

    addNode(_node) {
        this.nodes.push(_node);
    }

    addNodes(_nodes) {
        _nodes.forEach(node => {
            this._nodes.push(node);
        });
    }
}

class Node extends Microcontroller {
    constructor(input) {
        super(input);
        if (input) {
            if (!input.icon) this.icon = "circle-medium";
        }
    }
}