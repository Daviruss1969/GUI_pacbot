setup_execution();

function addLight(scene) {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 0);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);
}

function computePlateLength(studs) {
    return STUD_PADDING * 2 + studs * (STUD_WIDTH + STUD_SPACING) - STUD_SPACING
}

function computePlateDepth(depth) {
    return depth * PLATE_HEIGHT
}

function createFloor(dim_x, dim_y, scene) {
    x = computePlateLength(dim_x);
    y = computePlateLength(dim_y);
    var geometry = new THREE.BoxGeometry(x, PLATE_HEIGHT, y);
    var material = new THREE.MeshBasicMaterial({ color: 0x00b300 });
    var table = new THREE.Mesh(geometry, material);

    table.userData.name = 'table';

    scene.add(table);
    return addTableStuds(dim_x, dim_y, scene);
}

function addTableStuds(dim_x, dim_y, scene) {
    x = computePlateLength(dim_x);
    y = computePlateLength(dim_y);

    stud_levels = [];

    for (var i = 0; i < dim_x; i++) {
        stud_levels.push([]);
        for (var j = 0; j < dim_y; j++) {
            stud = new THREE.Mesh(new THREE.CylinderGeometry(STUD_WIDTH / 2, STUD_WIDTH / 2, STUD_HEIGHT, STUD_NUM_SIDES), new THREE.MeshLambertMaterial({ color: 0x00b300 }));

            stud.position.y = PLATE_HEIGHT + STUD_HEIGHT / 2
            stud.position.x = STUD_WIDTH / 2 + STUD_PADDING + i * (STUD_WIDTH + STUD_SPACING) - x / 2
            stud.position.z = STUD_WIDTH / 2 + STUD_PADDING + j * (STUD_WIDTH + STUD_SPACING) - y / 2

            stud_levels[i].push(0);
            stud.userData.id = i + "_" + j;

            scene.add(stud);
            table_studs.push(stud);
        }
    }
    return stud_levels;
}

function getColor(val) {
    var codes = {
        black: 0x191a1b,
        white: 0xfafafa,
        green: 0x00b300,
        red: 0xd10000,
        blue: 0x003399,
        yellow: 0xe6e600,
        olive: 0x808000,
        light_green: 0x90EE90,
        grey: 0x808080
    }
    return codes[val];
}

function get_dark_Color(val) {
    var codes = {
        black: 0x191a1b,
        white: 0xfafafa,
        green: 0x0D930D,
        red: 0xC31E1E,
        blue: 0x0C1F7F,
        yellow: 0xD2DA1D,
        olive: 0x556B2F,
        light_green: 0x8FBC8F
    }
    return codes[val];
}

function AddToGeometry(mainObject, objectToAdd) {
    var combined = new THREE.BufferGeometry();

    THREE.GeometryUtils.merge(combined, mainObject);
    THREE.GeometryUtils.merge(combined, objectToAdd);

    var mesh = new THREE.Mesh(combined, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    return mesh;
}

function update_stud_levels_from_file(below_left, dim_x, dim_y) {
    for (let i = below_left[0]; i < below_left[0] + dim_x; i++)
        for (let j = below_left[1] - dim_y + 1; j <= below_left[1]; j++)
            stud_levels[i][j] += 1;

}

function add_LEGO(color, dim_x, dim_y, pos_x, pos_y, pos_z, scene, draggable, type, name = "", update_stud_levels = true, fromCube = false) {
    x = computePlateLength(dim_x);
    z = computePlateLength(dim_y);
    if (typeof color === "string") {
        col = getColor(color);
    } else {
        col = color;
    }

    var geometry = new THREE.BoxGeometry(x, LEGO_HEIGHT, z);

    if (type != "current") {
        var material = new THREE.MeshBasicMaterial({
            color: col,
            opacity: 1,
            transparent: false
        });
    } else {
        var material = new THREE.MeshBasicMaterial({ color: col });

    }
    var cube = new THREE.Mesh(geometry, material);
    cube.name = name;
    if (fromCube) {
        cube.position.y = pos_y;
        cube.position.x = pos_x;
        cube.position.z = pos_z;
    } else {
        cube.position.y = (0.5 + pos_z) * LEGO_HEIGHT + PLATE_HEIGHT;
        cube.position.x = computePlateLength(pos_x) + x / 2;
        cube.position.z = -computePlateLength(pos_y - 1) - z / 2;
    }


    cube.userData.name = dim_x + 'x' + dim_y + '_' + color;

    // adding the lines surrounding the lego
    col2 = get_dark_Color(color);

    var geo = new THREE.EdgesGeometry(cube.geometry);
    var mat = new THREE.LineBasicMaterial({ color: col2, linewidth: 4 });
    var wireframe = new THREE.LineSegments(geo, mat);
    wireframe.renderOrder = 2; // make sure wireframes are rendered 2nd
    cube.add(wireframe);

    var all_studs = [];

    const c_x = cube.position.x;
    const c_y = cube.position.y;
    const c_z = cube.position.z;


    // adding the studs
    for (var i = 0; i < dim_x; i++) {
        for (var j = 0; j < dim_y; j++) {
            let width = STUD_WIDTH / 2;
            let height = STUD_HEIGHT / 1.5;
            let space = STUD_WIDTH / 4;
            studlt = new THREE.Mesh(new THREE.CylinderGeometry(width / 2, width / 2, height, STUD_NUM_SIDES), new THREE.MeshLambertMaterial({ color: col }));
            studlb = new THREE.Mesh(new THREE.CylinderGeometry(width / 2, width / 2, height, STUD_NUM_SIDES), new THREE.MeshLambertMaterial({ color: col }));
            studrt = new THREE.Mesh(new THREE.CylinderGeometry(width / 2, width / 2, height, STUD_NUM_SIDES), new THREE.MeshLambertMaterial({ color: col }));
            studrb = new THREE.Mesh(new THREE.CylinderGeometry(width / 2, width / 2, height, STUD_NUM_SIDES), new THREE.MeshLambertMaterial({ color: col }));

            studlt.position.y = (0.5) * LEGO_HEIGHT + (STUD_HEIGHT) / 2;
            studlt.position.x = (STUD_WIDTH / 4 + STUD_PADDING + i * (STUD_WIDTH + STUD_SPACING) - x / 2) - space;
            studlt.position.z = -(-z / 4 + STUD_WIDTH / 2 + STUD_PADDING + j * (STUD_WIDTH + STUD_SPACING));

            studlb.position.y = (0.5) * LEGO_HEIGHT + (STUD_HEIGHT) / 2;
            studlb.position.x = (STUD_WIDTH / 4 + STUD_PADDING + i * (STUD_WIDTH + STUD_SPACING) - x / 2) - space;
            studlb.position.z = -(-z / 1.5 + STUD_WIDTH / 2 + STUD_PADDING + j * (STUD_WIDTH + STUD_SPACING));

            studrt.position.y = (0.5) * LEGO_HEIGHT + (STUD_HEIGHT) / 2;
            studrt.position.x = (STUD_WIDTH / 1.5 + STUD_PADDING + i * (STUD_WIDTH + STUD_SPACING) - x / 2) + space;
            studrt.position.z = -(-z / 4 + STUD_WIDTH / 2 + STUD_PADDING + j * (STUD_WIDTH + STUD_SPACING));

            studrb.position.y = (0.5) * LEGO_HEIGHT + (STUD_HEIGHT) / 2;
            studrb.position.x = (STUD_WIDTH / 1.5 + STUD_PADDING + i * (STUD_WIDTH + STUD_SPACING) - x / 2) + space;
            studrb.position.z = -(-z / 1.5 + STUD_WIDTH / 2 + STUD_PADDING + j * (STUD_WIDTH + STUD_SPACING));

            cube.add(studlt);
            cube.add(studlb);
            cube.add(studrt);
            cube.add(studrb);
        }
    }

    if (type == 'previous') {
        draw_borders(cube, x, z, "black", 4);
        previous = cube;

    } else if (type == 'current') {
        draw_borders(cube, x, z, col2, 1);
        current = cube;
    } else {
        draw_borders(cube, x, z, col2, 1);

    }

    if (draggable) {
        objects.push(cube);
    }

    scene.add(cube);

    if (update_stud_levels) {
        // updating the below studs
        var below_left = [];
        below_left.push(pos_x + 24);
        below_left.push(Math.abs(pos_y) + 11);

        update_stud_levels_from_file(below_left, dim_x, dim_y);
    }

    return cube;
}

function remove_LEGO(lego_obj) {
    // how to remove a lego
    scene.remove(lego_obj);
    objects.pop(lego_obj);
}

function draw_borders(cube, x, z, color, width) {

    var basic_width = LEGO_HEIGHT / 40;

    var width = basic_width * width;

    var geom1 = new THREE.BoxGeometry(x, width, width);
    var mat1 = new THREE.MeshBasicMaterial({ color: "black" });
    var cube1 = new THREE.Mesh(geom1, mat1);
    cube1.position = cube.position;
    cube1.position.y = cube1.position.y - LEGO_HEIGHT / 2;
    cube1.position.z = cube1.position.z + z / 2;
    cube.add(cube1);


    var geom2 = new THREE.BoxGeometry(x, width, width);
    var mat2 = new THREE.MeshBasicMaterial({ color: "black" });
    var cube2 = new THREE.Mesh(geom2, mat2);
    cube2.position = cube.position;
    cube2.position.y = cube2.position.y + LEGO_HEIGHT / 2;
    cube2.position.z = cube2.position.z + z / 2;
    cube.add(cube2);


    var geom3 = new THREE.BoxGeometry(x, width, width);
    var mat3 = new THREE.MeshBasicMaterial({ color: "black" });
    var cube3 = new THREE.Mesh(geom3, mat3);
    cube3.position = cube.position;
    cube3.position.y = cube3.position.y + LEGO_HEIGHT / 2;
    cube3.position.z = cube3.position.z - z / 2;
    cube.add(cube3);


    var geom4 = new THREE.BoxGeometry(x, width, width);
    var mat4 = new THREE.MeshBasicMaterial({ color: "black" });
    var cube4 = new THREE.Mesh(geom3, mat3);
    cube4.position = cube.position;
    cube4.position.y = cube4.position.y - LEGO_HEIGHT / 2;
    cube4.position.z = cube4.position.z - z / 2;
    cube.add(cube4);

    // 
    // 

    var geom_a = new THREE.BoxGeometry(width, width, z);
    var mat_a = new THREE.MeshBasicMaterial({ color: "black" });
    var cube_a = new THREE.Mesh(geom_a, mat_a);
    cube_a.position = cube.position;
    cube_a.position.x = cube_a.position.x - x / 2;
    cube_a.position.y = cube_a.position.y - LEGO_HEIGHT / 2;
    cube.add(cube_a);

    var geom_b = new THREE.BoxGeometry(width, width, z);
    var mat_b = new THREE.MeshBasicMaterial({ color: "black" });
    var cube_b = new THREE.Mesh(geom_b, mat_b);
    cube_b.position = cube.position;
    cube_b.position.x = cube_b.position.x - x / 2;
    cube_b.position.y = cube_b.position.y + LEGO_HEIGHT / 2;
    cube.add(cube_b);

    var geom_c = new THREE.BoxGeometry(width, width, z);
    var mat_c = new THREE.MeshBasicMaterial({ color: "black" });
    var cube_c = new THREE.Mesh(geom_c, mat_c);
    cube_c.position = cube.position;
    cube_c.position.x = cube_c.position.x + x / 2;
    cube_c.position.y = cube_c.position.y + LEGO_HEIGHT / 2;
    cube.add(cube_c);

    var geom_d = new THREE.BoxGeometry(width, width, z);
    var mat_d = new THREE.MeshBasicMaterial({ color: "black" });
    var cube_d = new THREE.Mesh(geom_d, mat_d);
    cube_d.position = cube.position;
    cube_d.position.x = cube_d.position.x + x / 2;
    cube_d.position.y = cube_d.position.y - LEGO_HEIGHT / 2;
    cube.add(cube_d);

    //
    //

    var geom_1 = new THREE.BoxGeometry(width, LEGO_HEIGHT, width);
    var mat_1 = new THREE.MeshBasicMaterial({ color: "black" });
    var cube_1 = new THREE.Mesh(geom_1, mat_1);
    cube_1.position = cube.position;
    cube_1.position.x = cube_1.position.x - x / 2;
    cube_1.position.z = cube_1.position.z + z / 2;
    cube.add(cube_1);

    var geom_2 = new THREE.BoxGeometry(width, LEGO_HEIGHT, width);
    var mat_2 = new THREE.MeshBasicMaterial({ color: "black" });
    var cube_2 = new THREE.Mesh(geom_2, mat_2);
    cube_2.position = cube.position;
    cube_2.position.x = cube_2.position.x - x / 2;
    cube_2.position.z = cube_2.position.z - z / 2;
    cube.add(cube_2);

    var geom_3 = new THREE.BoxGeometry(width, LEGO_HEIGHT, width);
    var mat_3 = new THREE.MeshBasicMaterial({ color: "black" });
    var cube_3 = new THREE.Mesh(geom_3, mat_3);
    cube_3.position = cube.position;
    cube_3.position.x = cube_3.position.x + x / 2;
    cube_3.position.z = cube_3.position.z + z / 2;
    cube.add(cube_3);

    var geom_4 = new THREE.BoxGeometry(width, LEGO_HEIGHT, width);
    var mat_4 = new THREE.MeshBasicMaterial({ color: "black" });
    var cube_4 = new THREE.Mesh(geom_4, mat_4);
    cube_4.position = cube.position;
    cube_4.position.x = cube_4.position.x + x / 2;
    cube_4.position.z = cube_4.position.z - z / 2;
    cube.add(cube_4);
}

// adding, from saved data, the lego objects
function read_file(id, section) {
    const file = "../data/scenes.json";

    fetch(file)
        .then(function(resp) {
            return resp.json();
        })
        .then(function(data) {
            add_objects(data, id, section)
        });
}

function add_objects(data, id, section) {


    data = [{
        "scene": 2,
        "section": "data",
        "radio": true,
        "text": true,
        "table": [
            { "dim": [6, 2, 1], "pos": [4, 0, 0], "color": "yellow", "type": "other" },
            { "dim": [6, 2, 1], "pos": [-2, -2, 0], "color": "red", "type": "previous" }
        ]
    }]

    for (let s of data) {
        for (let obj of s.table) {
            dim = obj.dim;
            pos = obj.pos;
            color = obj.color;
            type = obj.type;

            if (type == 'current')
                drag = true;
            else
                drag = false;
            cub = add_LEGO(color, dim[0], dim[1], pos[0], pos[1], pos[2], scene, drag, type);
        }
    }
}

function blink_effect() {
    plan_legos.forEach((value, key) => {
        let lego = value["lego"];
        var t = lego.material.opacity;

        if (t == 1) {
            t = value["variation"];
        } else {
            t = 1;
        }

        for (let obj of lego.children) {
            obj.material.transparent = true;
            obj.material.opacity = t;
        }

        lego.material.transparent = true;
        lego.material.opacity = t;
    })
}

function render_animate_selected() {
    clearInterval(myVar);
    myVar = setInterval(function() { blink_effect() }, 800);
}

// 
// 
// 
// 
// 
// 
// 
//
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 

// main
function setup_execution() {
    STUD_WIDTH = 4.8;
    STUD_SPACING = 3.2;
    PLATE_HEIGHT = 0.5;
    STUD_HEIGHT = 1.7;
    STUD_PADDING = STUD_WIDTH / 3.2; // table sides
    STUD_NUM_SIDES = 32;
    LEGO_HEIGHT = 9.6;
    FloorWidth = 28;
    FloorHeight = 11;



    // table positions
    MIN_X = -computePlateLength(FloorWidth / 2);
    MIN_Y = -computePlateLength(FloorHeight / 2);
    MAX_X = computePlateLength(FloorWidth / 2);
    MAX_Y = computePlateLength(FloorHeight / 2);

    objects = [];

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);


    init_pos_x = -1.902388126728884;
    init_pos_y = 195.6798407538288;
    init_pos_z = 83.03738904083703;

    init_rot_x = -1.2028291652806293;
    init_rot_y = 0.0017060211432452725;
    init_rot_z = 0.004425142911459734;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // LEGO table
    table_studs = [];
    stud_levels = createFloor(FloorWidth, FloorHeight, scene);


    // light
    addLight(scene);



    // special lego objs
    // this legos array contains the informations of the top legos in x,y coordinate
    legos = new Map();

    // this legos array contains the informations of all the futures lego in x,y,é coordinate
    plan_legos = new Map();

    stop_robot = false;
    oldGoal = -1;
    oldMove = -1;
    current = undefined;
    previous = undefined;
    blink = "up";


    //for the choose one
    lego_g = undefined;
    LEGO_move = undefined;
    lego_goal = undefined;
    lego_down = undefined;


    //variable for the blinking effect
    myVar = undefined;

    // Variables for the gripper animation 
    id = undefined;
    distance_beg = 18;
    grip_t = undefined;
    gripper_OG_t = undefined;
    speed_t = 1.5;


    render_animate_selected();

    dir = new THREE.Vector3();
    sph = new THREE.Spherical();


    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
        camera.getWorldDirection(dir);
        sph.setFromVector3(dir);
    });


}



/* 
  this function take an json in entrie, parse it and show on screen the data of the json in a specifical way to have better coherance.
*/
function read_robot_input(file_data = "../data/data.json", file_plan = "../data/plan.json", animate = false) {

    let update = false;
    //get the json file and parse it
    fetch(file_data).then(function(resp) {
        return resp.json();
    }).then(function(data) {

        //Iterate trought object receive
        Object.keys(data).forEach(key => {

            //Split for the position
            let char = key.split('');

            //get the position of the current lego
            let position = {
                x: parseInt(char[5] + char[6]) - FloorWidth / 2,
                y: -(parseInt(char[2] + char[3]) - FloorHeight / 2),
                z: parseInt(data[key][1])
            }

            //Type of the lego, other - previous - current, if the key is the one who be place, we set the type to previous
            let type = "other";

            //if there is no legos at x,y coords or if there is one more legos in the x,y coords or if it's not the same type we add an lego or change the current one
            if (legos.get(key) == undefined || JSON.stringify(legos.get(key)["position"]) != JSON.stringify(position) || legos.get(key)["type"] != type) {

                //color
                color = getColorFromData(data[key][0]);


                //Create an lego with the informations
                var lego = {
                    type: type,

                    position: position,

                    color: color,

                    name: key + "_" + position["z"]
                }



                //If we remove one lego
                if (legos.get(key) != undefined) {
                    let difference = lego["position"]["z"] - legos.get(key)["position"]["z"];
                    if (difference < 0) {
                        for (let i = 0; i < Math.abs(difference); i++) {
                            delpos = legos.get(key)["position"]["z"] - i;
                            delname = lego["name"].substring(0, 8);
                            delname = delname + delpos.toString();
                            let obj = scene.getObjectByName(delname);
                            remove_LEGO(obj);
                        }
                    }
                }


                //add to the map
                legos.set(key, lego);

                //we add the lego to the scene
                add_LEGO(legos.get(key)["color"],
                    1,
                    1,
                    legos.get(key)["position"]["x"],
                    legos.get(key)["position"]["y"],
                    legos.get(key)["position"]["z"],
                    scene,
                    false,
                    legos.get(key)["type"],
                    legos.get(key)["name"],
                    false);
            }
        });

        //update the lego and the goal who will be choose by the robot
        updatePlan(file_plan);
    })
}

function updatePlan(file_plan) {


    fetch(file_plan).then(function(resp) {
        return resp.json();
    }).then(function(data) {
        //variable for the blinking variation
        let variation = 0;

        //iterate trought the json
        for (let key = 0; key < Object.keys(data).length; key++) {


            //put legos
            if (data[key][0].includes("put")) {
                //increase the varition
                variation += 0.2;


                //for each case we have to know the length of the piece we take
                let iterator = data[key][0].charAt(data[key][0].length - 1) / 2;

                for (let i = 0; i < iterator; i++) {
                    //position
                    let pos = data[key][2].split('');
                    let Dx = 0;
                    let Dy = 0;
                    //if there is a rotation
                    if (data[key - 1][0].includes("rotate")) {
                        //if there is no rotations 
                        Dy = 1 * i;
                    } else {
                        Dx = 1 * i;
                    }
                    let position = {
                        x: parseInt(pos[5] + pos[6]) + Dx - FloorWidth / 2,
                        y: -(parseInt(pos[2] + pos[3]) + Dy - FloorHeight / 2),
                        z: parseInt(pos[8])
                    }

                    //color
                    let color = getColorFromData(data[key][1].charAt(0));

                    let name;
                    if (i == 0) {
                        name = data[key][2];
                    } else {
                        let x = parseInt(pos[5] + pos[6]) + Dx;
                        if (x < 10) {
                            x = '0' + x;
                        }
                        let y = parseInt(pos[2] + pos[3]) + Dy;
                        if (y < 10) {
                            y = '0' + y;
                        }
                        name = "p_" + x + "_" + y + "_" + position["z"];
                    }

                    let lego = {
                        type: "current",

                        position: position,

                        color: color,

                        name: name,

                        variation: variation
                    }

                    lego["lego"] = add_LEGO(lego["color"],
                        1,
                        1,
                        lego["position"]["x"],
                        lego["position"]["y"],
                        lego["position"]["z"],
                        scene,
                        false,
                        lego["type"],
                        lego["name"],
                        false);

                    plan_legos.set(lego["name"], lego);
                }

            }

        }







        /*
        //the lego who will be move (have to exist)
        move = Object.keys(data)[0]

        //where the lego need to be, (don't exist)
        goal = Object.keys(data)[1];


        //if the old current one is different than the goal we have to change things
        if (oldGoal != goal) {
            let isUpdate = false;

            //if there is a current lego, play the place animation on it
            if (oldGoal != -1) {

                //set the transparant lego and delete it after
                lego_g = scene.getObjectByName(legos.get(oldGoal)["name"] + "_goal");
                lego_g.material.transparent = true;
                lego_g.material.opacity = 0.5;

                //get the place where the lego will drop
                lego_goal = scene.getObjectByName(legos.get(oldGoal)["name"]);


                //get the lego who have to drop
                lego_down = scene.getObjectByName(legos.get(oldMove)["name"]);





                //play the animation and delete it (inside the function)
                throwLego();

                isUpdate = true;
            }

            //update
            oldGoal = goal;
            oldMove = move;

            //replace the move lego by one who have border
            lego_move = legos.get(move);
            remove_LEGO(scene.getObjectByName(lego_move["name"]));

            //update lego
            lego_move["type"] = "previous";
            lego_move["name"] = lego_move["name"] + "_move";

            LEGO_move = add_LEGO(lego_move["color"],
                1,
                1,
                lego_move["position"]["x"],
                lego_move["position"]["y"],
                lego_move["position"]["z"],
                scene,
                false,
                lego_move["type"],
                lego_move["name"],
                false
            );


            //set the goal blinking
            let char = goal.split('');

            let position = {
                x: parseInt(char[5] + char[6]) - FloorWidth / 2,
                y: -(parseInt(char[2] + char[3]) - FloorHeight / 2),
                z: parseInt(data[goal][1])
            }

            let color = getColorFromData(data[goal][0]);

            let lego = {
                type: "current",

                position: position,

                color: color,

                name: goal + "_" + position["z"]
            }

            add_LEGO(lego["color"],
                1,
                1,
                lego["position"]["x"],
                lego["position"]["y"],
                lego["position"]["z"],
                scene,
                false,
                lego["type"],
                lego["name"] + "_goal",
                false);
            if (!isUpdate) {
                //test();
            }
        } else {
            //test();
        }*/
    });
}




function getColorFromData(color_) {
    //Choose the color
    let color;
    switch (color_) {
        case 'b':
            color = "blue";
            break;
        case 'g':
            color = "green";
            break;
        case 'r':
            color = "red";
            break;
        case 'y':
            color = "yellow";
            break;
        case 'o':
            color = "olive";
            break;
        case 'l':
            color = "light_green";
            break;
        default:
            color = "black";
            break;
    }
    return color;
}




//add a gripper to the screen at the correct position
function add_gripper(color, pos, orientation, scene) {

    //get color of the gripper
    col = getColor(color);

    pole_height = LEGO_HEIGHT * 30;

    var pole_geometry = new THREE.BoxGeometry(STUD_WIDTH * 0.4, pole_height, STUD_WIDTH * 0.4);
    var pole_material = new THREE.MeshBasicMaterial({ color: col });
    var pole = new THREE.Mesh(pole_geometry, pole_material);
    pole.position.y = pos.y + LEGO_HEIGHT / 2 + pole_height / 2;
    pole.position.x = pos.x;
    pole.position.z = pos.z;
    pole.userData.name = "pole";


    // children

    var base_geometry = new THREE.BoxGeometry(STUD_WIDTH, STUD_HEIGHT / 2, STUD_WIDTH);
    var base_material = new THREE.MeshBasicMaterial({ color: col });
    var base = new THREE.Mesh(base_geometry, base_material);
    base.position.y = pos.y - pole.position.y + STUD_WIDTH;
    base.position.x = pos.x - pole.position.x;
    base.position.z = pos.z - pole.position.z;
    base.userData.name = "base";

    // grippers

    cub_size = STUD_SPACING + 2 * (STUD_PADDING + STUD_WIDTH);

    var grip_right_geometry = new THREE.BoxGeometry(1.5 * cub_size, STUD_HEIGHT, 0.5 * STUD_WIDTH);
    var grip_right_material = new THREE.MeshBasicMaterial({ color: col });
    var grip_right = new THREE.Mesh(grip_right_geometry, grip_right_material);
    grip_right.position.y = pos.y - pole.position.y + 1.5 * STUD_WIDTH;
    grip_right.position.x = pos.x - pole.position.x;
    grip_right.position.z = pos.z - pole.position.z;
    grip_right.rotation.set(0, Math.PI / 4, 0);
    grip_right.userData.name = "grip_right";


    var grip_left = new THREE.Mesh(grip_right_geometry, grip_right_material);
    grip_left.position.y = pos.y - pole.position.y + 1.5 * STUD_WIDTH;
    grip_left.position.x = pos.x - pole.position.x;
    grip_left.position.z = pos.z - pole.position.z;
    grip_left.rotation.set(0, -Math.PI / 4, 0);
    grip_left.userData.name = "grip_left";


    // adding to pole
    pole.add(grip_right);
    pole.add(grip_left);
    pole.add(base);


    // adding to scene
    scene.add(pole);

    return pole;
}

//
//
//
//
//
//
//
//
//
//
//
//
//
//ANIMATION OF THE GRIP


function throwLego() {
    //get the position of the previous lego
    prev_OG = Object();
    Object.assign(prev_OG, lego_goal.position);

    //remove the lego which was choose
    scene.remove(lego_down);

    //add a gripper at the right place
    grip_t = add_gripper("grey", prev_OG, "horizontal", scene);

    //where the gripper will start
    lego_goal.position.y *= distance_beg;
    grip_t.position.y += (lego_goal.position.y - prev_OG.y);

    //create the gripper and run animation
    gripper_OG_t = Object();
    Object.assign(gripper_OG_t, grip_t.position);
    animate_down_t();
}

//when the gripper goes down
function animate_down_t() {

    //we get the number of the actual animation frame
    id = requestAnimationFrame(animate_down_t);

    //show it on screen
    renderer.render(scene, camera);

    //If it's finish
    if (lego_goal.position.y <= prev_OG.y) {
        lego_goal.position.y = prev_OG.y;
        cancelAnimationFrame(id);
        animate_up_t();
    } else {
        //update position for next frame
        lego_goal.position.y -= prev_OG.y / speed_t;
        grip_t.position.y -= prev_OG.y / speed_t;
    }

}

function animate_up_t() {
    id = requestAnimationFrame(animate_up_t);

    renderer.render(scene, camera);


    if (grip_t.position.y >= gripper_OG_t.y) {

        cancelAnimationFrame(id);

        //remove the gripper
        scene.remove(grip_t);

        //remove the old current
        scene.remove(lego_g);

        //test();
    } else {
        grip_t.position.y += prev_OG.y / speed_t;
    }

}


//
//
//
//
//
//
//
//
//
//
//
//
// start navigation orbit

document.getElementById("top").addEventListener("click", function() {
    var new_pos_x = camera.position.x;
    var new_pos_y = camera.position.y;
    var new_pos_z = camera.position.z - 40;

    camera.position.set(new_pos_x, new_pos_y, new_pos_z);
});

document.getElementById("bottom").addEventListener("click", function() {
    var new_pos_x = camera.position.x;
    var new_pos_y = camera.position.y;
    var new_pos_z = camera.position.z + 40;

    camera.position.set(new_pos_x, new_pos_y, new_pos_z);

});

document.getElementById("right").addEventListener("click", function() {
    var new_pos_x = camera.position.x + 40;
    var new_pos_y = camera.position.y;
    var new_pos_z = camera.position.z;

    camera.position.set(new_pos_x, new_pos_y, new_pos_z);

});

document.getElementById("left").addEventListener("click", function() {
    var new_pos_x = camera.position.x - 40;
    var new_pos_y = camera.position.y;
    var new_pos_z = camera.position.z;

    camera.position.set(new_pos_x, new_pos_y, new_pos_z);
});

document.getElementById("middle").addEventListener("click", function() {
    camera.position.set(init_pos_x, init_pos_y, init_pos_z);
    camera.rotation.set(init_rot_x, init_rot_y, init_rot_z);
    scene.rotation.set(0, 0, 0);

    compass.style.transform = `rotate(${0}deg)`;


});

document.getElementById("zoom_in").addEventListener("click", function() {
    var new_pos_x = camera.position.x;
    var new_pos_y = camera.position.y - 10;
    var new_pos_z = camera.position.z - 5;

    camera.position.set(new_pos_x, new_pos_y, new_pos_z);

});

document.getElementById("zoom_out").addEventListener("click", function() {
    var new_pos_x = camera.position.x;
    var new_pos_y = camera.position.y + 10;
    var new_pos_z = camera.position.z + 5;

    camera.position.set(new_pos_x, new_pos_y, new_pos_z);

});


// zoom with mouse
document.addEventListener("wheel", function() {
    //wheel goes up or down
    if (event.deltaY > 0) {
        var new_pos_x = camera.position.x;
        var new_pos_y = camera.position.y + 10;
        var new_pos_z = camera.position.z + 5;

        camera.position.set(new_pos_x, new_pos_y, new_pos_z);
    } else {
        var new_pos_x = camera.position.x;
        var new_pos_y = camera.position.y - 10;
        var new_pos_z = camera.position.z - 5;

        camera.position.set(new_pos_x, new_pos_y, new_pos_z);
    }
});


//move with arrow keys
document.addEventListener("keydown", function(event) {
    let dX = 0;
    let dZ = 0;
    switch (event.key) {
        case "ArrowRight":
            dX = 40;
            break;
        case "ArrowLeft":
            dX = -40;
            break;
        case "ArrowUp":
            dZ = -40;
            break;
        case "ArrowDown":
            dZ = 40;
            break;
    }

    var new_pos_x = camera.position.x + dX;
    var new_pos_y = camera.position.y;
    var new_pos_z = camera.position.z + dZ;

    camera.position.set(new_pos_x, new_pos_y, new_pos_z);

});

// end navigation orbit


camera.position.set(init_pos_x, init_pos_y, init_pos_z);
camera.rotation.set(init_rot_x, init_rot_y, init_rot_z);

//
//
//
//
//
//
//
//just for testing
var iterator = 2;

function test() {
    setTimeout(function() {
        if (!stop_robot) {
            console.log(iterator);
            file = "../data/data" + iterator + ".json";
            file2 = "../data/choose" + iterator + ".json";
            read_robot_input(file, file2);
            if (iterator < 5) {
                iterator++;
            }
        }
    }, 200)
}

function startExec() {
    stop_robot = false;

    //press the button
    let button = document.querySelector('#start');
    button.disabled = true;

    //start the function
    read_robot_input();
}

function stopExec() {

    stop_robot = true;

    //unpress the button
    let button = document.querySelector('#start');
    button.disabled = false;
}


function resetExec() {
    document.location.reload(true);
}



//TODO AJOUTER LES BOUTONS + dessiner correctement les legos (les studs)