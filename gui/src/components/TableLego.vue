<template>
    <div id=containerTable></div>
</template>

<script>
import * as THREE from 'three'
//import { geometry } from 'three';

export default {
    name:"TableLego",
    data(){
        return{
            camera: null,
            scene: null,
            renderer: null,
            mesh: null,


            STUD_WIDTH: null,
            STUD_SPACING: null,
            PLATE_HEIGHT: null,
            STUD_HEIGHT: null,
            STUD_PADDING: null,// table sides
            STUD_NUM_SIDES: null,
            LEGO_HEIGHT: null,

            FloorWidth: null,
            FloorHeight: null,
            init_pos_x :null,
            init_pos_y :null,
            init_pos_z :null,

            init_rot_x :null,
            init_rot_y :null,
            init_rot_z :null,

            table_studs: null,
            stud_levels: null,

            // this legos map contains the informations of the top legos in x,y coordinate
            legos: null,

            // this action array contains the differents futures action of the robot
            actions: null,

            // this legos map contains the informations of all the futures lego in x,y,z coordinate
            plan_legos: null,

            //
            plan: null,

            stop_robot: null,
        
            current: null,
            previous: null,

            //variable for the blinking effect
            myVar: null,

            dir: null,
            sph: null,
            table: null
        }
    },
    methods:{
        init: function(){
            //global legos fonctions
            this.STUD_WIDTH = 4.8;
            this.STUD_SPACING = 3.2;
            this.PLATE_HEIGHT = 0.5;
            this.STUD_HEIGHT = 1.7;
            this.STUD_PADDING = this.STUD_WIDTH / 3.2; // table sides
            this.STUD_NUM_SIDES = 32;
            this.LEGO_HEIGHT = 9.6;

            this.FloorWidth = 28;
            this.FloorHeight = 11;

            this.objects = [];


            let container = document.getElementById('container');
            
            //todo peut être à changer
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(60, container.clientWidth/container.clientHeight, 1, 1000); //maybe to change
            this.camera.position.z += 100;
            this.camera.position.y += 200;
            this.camera.rotation.x = -70 * Math.PI / 180

            this.init_pos_x = -1.902388126728884;
            this.init_pos_y = 195.6798407538288;
            this.init_pos_z = 83.03738904083703;
            
            this.init_rot_x = -1.2028291652806293;
            this.init_rot_y = 0.0017060211432452725;
            this.init_rot_z = 0.004425142911459734;

            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setSize(container.clientWidth, container.clientHeight);
            container.appendChild(this.renderer.domElement);

            this.table_studs = [];
            this.stud_levels = this.createFloor(this.FloorWidth, this.FloorHeight, this.scene);
            /*this.camera.position.set(4,5,3)
            this.camera.lookAt(this.table);*/
            // light
            this.addLight(this.scene);


            this.legos = new Map();

            // this action array contains the differents futures action of the robot
            this.actions = new Array();

            // this legos map contains the informations of all the futures lego in x,y,z coordinate
            this.plan_legos = new Map();

            //
            this.plan = new Array();

            this.stop_robot = false;
        
            this.current = undefined;
            this.previous = undefined;

            this.myVar = undefined;

            this.render_animate_selected();


            this.dir = new THREE.Vector3();
            this.sph = new THREE.Spherical();
            this.renderer.setAnimationLoop(() => {
                this.renderer.render(this.scene, this.camera);
                this.camera.getWorldDirection(this.dir);
                this.sph.setFromVector3(this.dir);
            });

        },
        read_robot_input(file_data = "../data/data.json", file_plan = "../data/plan.json"){
            //get the json file and parse it
            var instance = this;
            fetch(file_data).then(function(resp) {
                return resp.json();
            }).then(function(data) { 
                //Iterate trought object receive
                Object.keys(data).forEach(key => {

                    //Split for the position
                    let char = key.split('');

                    //get the position of the current lego
                    let position = {
                        x: parseInt(char[5] + char[6]) - instance.FloorWidth / 2,
                        y: -(parseInt(char[2] + char[3]) - instance.FloorHeight / 2),
                        z: parseInt(data[key][1])
                    }

                    //Type of the lego, other - previous - current, if the key is the one who be place, we set the type to previous
                    let type = "other";
                    if (instance.legos.get(key) == undefined || JSON.stringify(instance.legos.get(key)["position"]) != JSON.stringify(position) || instance.legos.get(key)["type"] != type){
                        //color
                        let color = instance.getColorFromData(data[key][0]);


                        //Create an lego with the informations
                        var lego = {
                            type: type,

                            position: position,

                            color: color,

                            name: key + "_" + position["z"]
                        }

                        //If we remove one lego
                        if (instance.legos.get(key) != undefined) {
                            let difference = lego["position"]["z"] - instance.legos.get(key)["position"]["z"];
                            if (difference < 0) {
                                for (let i = 0; i < Math.abs(difference); i++) {
                                    let delpos = instance.legos.get(key)["position"]["z"] - i;
                                    let delname = lego["name"].substring(0, 8);
                                    delname = delname + delpos.toString();
                                    let obj = instance.scene.getObjectByName(delname);
                                    instance.scene.remove(obj)
                                }
                            }
                        }

                        //add to the map
                        instance.legos.set(key, lego);

                        //we add the lego to the scene
                        instance.add_LEGO(instance.legos.get(key)["color"],
                            1,
                            1,
                            instance.legos.get(key)["position"]["x"],
                            instance.legos.get(key)["position"]["y"],
                            instance.legos.get(key)["position"]["z"],
                            instance.scene,
                            false,
                            instance.legos.get(key)["type"],
                            instance.legos.get(key)["name"],
                            false);
                    }


                });
                //update the lego and the goal who will be choose by the robot
                instance.updatePlan(file_plan);
            });
        },
        updatePlan(file_plan){
            //TODO if to change
            var instance = this;

            //eslint-disable-next-line
            if (true) {
                fetch(file_plan).then(function(resp) {
                    return resp.json();
                }).then(function(data) {
                    instance.plan = data;
                    instance.updateLegos();
                });
            } else {
                instance.updateLegos();
            }

        },
        updateLegos(){
            //variable for the blinking variation and the border intensity

            let variation = 0.2;
            //eslint-disable-next-line
            let intensity = 5;

            //TODO IF TO CHANGE
            //eslint-disable-next-line
            if (true){
                this.plan_legos.clear();
                let max = 4;
                if (this.plan.length < max){
                    max = this.plan.length;
                }
                for (let i = 0; i < max; i++) {
                    let key = Object.keys(this.plan[i]);

                    let step = this.plan[i][key];
                    //console.log(step);



                    //set the blinking one 
                    //get the good place in the array
                    let place = 1;
                    if (step[2] != undefined) {
                        place = 2;
                    }

                    //get only the good information to an array
                    let positions = step[place].split(" ");

                    //get the color
                    let color = positions[1].charAt(0);
                    color = this.getColorFromData(color);
                    positions.splice(0, 2);

                    //add blink at good position
                    for (let j = 0; j < positions.length; j++) {

                        let name = positions[j];
                        let position = {
                            x: parseInt(positions[j].charAt(5) + positions[j].charAt(6)) - this.FloorWidth / 2,
                            y: -(parseInt(positions[j].charAt(2) + positions[j].charAt(3)) - this.FloorHeight / 2),
                            z: parseInt(positions[j].charAt(8))
                        }

                        let lego = {
                            type: "current",

                            position: position,

                            color: color,

                            name: name,

                            variation: variation
                        }

                        lego["lego"] = this.add_LEGO(
                            lego["color"],
                            1,
                            1,
                            lego["position"]["x"],
                            lego["position"]["y"],
                            lego["position"]["z"],
                            this.scene,
                            false,
                            lego["type"],
                            lego["name"],
                            false
                        );
                        
                        this.plan_legos.set(lego["name"], lego);

                    }
                    variation+= 0.2;
                }

            }
        },
        addLight(scene) {
            const color = 0xFFFFFF;
            const intensity = 1;
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(0, 10, 0);
            light.target.position.set(-5, 0, 0);
            scene.add(light);
            scene.add(light.target);
        },
        computePlateLength(studs) {
            return this.STUD_PADDING * 2 + studs * (this.STUD_WIDTH + this.STUD_SPACING) - this.STUD_SPACING
        },
        createFloor(dim_x, dim_y, scene){
            let x = this.computePlateLength(dim_x);
            let y = this.computePlateLength(dim_y);
            var geometry = new THREE.BoxGeometry(x, this.PLATE_HEIGHT, y);
            var material = new THREE.MeshBasicMaterial({ color: 0x00b300 });
            this.table = new THREE.Mesh(geometry, material);

            this.table.userData.name = 'table';

            scene.add(this.table);
            return this.addTableStuds(dim_x, dim_y, scene);
        },
        addTableStuds(dim_x, dim_y, scene){
            let x = this.computePlateLength(dim_x);
            let y = this.computePlateLength(dim_y);

            let stud_levels = [];

            for (var i = 0; i < dim_x; i++) {
                stud_levels.push([]);
                for (var j = 0; j < dim_y; j++) {
                    let stud = new THREE.Mesh(new THREE.CylinderGeometry(this.STUD_WIDTH / 2, this.STUD_WIDTH / 2, this.STUD_HEIGHT, this.STUD_NUM_SIDES), new THREE.MeshLambertMaterial({ color: 0x00b300 }));
                    stud.position.y = this.PLATE_HEIGHT + this.STUD_HEIGHT / 2
                    stud.position.x = this.STUD_WIDTH / 2 + this.STUD_PADDING + i * (this.STUD_WIDTH + this.STUD_SPACING) - x / 2
                    stud.position.z = this.STUD_WIDTH / 2 + this.STUD_PADDING + j * (this.STUD_WIDTH + this.STUD_SPACING) - y / 2

                    stud_levels[i].push(0);
                    stud.userData.id = i + "_" + j;
                    scene.add(stud);
                    this.table_studs.push(stud);
                }
            }
            return stud_levels;
        },
        render_animate_selected(){
            clearInterval(this.myVar);
            this.myVar = setInterval(this.blink_effect, 800);
        },
        blink_effect() {

            this.plan_legos.forEach((value) => {
                let lego = value["lego"];
                let t = lego.material.opacity;
                let alphaTest;
                if (t == 1) {
                    t = value["variation"];
                    alphaTest = 0.1;
                } else {
                    t = 1;
                    alphaTest = 0;
                }

                for (let obj of lego.children) {
                    obj.material.transparent = true;
                    obj.alphaTest = 0.1;
                    obj.material.opacity = t;
                    obj.material.alphaTest = alphaTest;
                }

                lego.material.transparent = true;
                lego.material.opacity = t;
                lego.material.alphaTest = alphaTest;
            })
        },
        getColorFromData(color_){
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
                case 'w':
                    color = "white";
                    break;
                default:
                    color = "black";
                    break;
            }
            return color;
        },
        add_LEGO(color, dim_x, dim_y, pos_x, pos_y, pos_z, scene, draggable, type, name = ""){
            let x = this.computePlateLength(dim_x);
            let z = this.computePlateLength(dim_y);

            let col = this.getColor(color);

            var geometry = new THREE.BoxGeometry(x, this.LEGO_HEIGHT, z)

            var material;
            if (type != "current"){
                material = new THREE.MeshBasicMaterial({
                    color: col,
                    opacity: 1,
                    transparent: false
                });
            }else{
               material = new THREE.MeshBasicMaterial({ color: col }); 
            }


            var cube = new THREE.Mesh(geometry, material);
            cube.name = name;

            cube.position.y = (0.5 + pos_z) * this.LEGO_HEIGHT + this.PLATE_HEIGHT;
            cube.position.x = this.computePlateLength(pos_x) + x / 2;
            cube.position.z = -this.computePlateLength(pos_y - 1) - z / 2;

            cube.userData.name = dim_x + 'x' + dim_y + '_' + color;

            let col2 = this.get_dark_Color(color);

            var geo = new THREE.EdgesGeometry(cube.geometry);
            var mat = new THREE.LineBasicMaterial({ color: col2, linewidth: 4 });
            var wireframe = new THREE.LineSegments(geo, mat);
            wireframe.renderOrder = 2; // make sure wireframes are rendered 2nd
            cube.add(wireframe);

            for (var i = 0; i < dim_x; i++) {
                for (var j = 0; j < dim_y; j++) {
                    let width = this.STUD_WIDTH / 2;
                    let height = this.STUD_HEIGHT / 1.5;
                    let space = this.STUD_WIDTH / 4;

                    let studlt = new THREE.Mesh(new THREE.CylinderGeometry(width / 2, width / 2, height, this.STUD_NUM_SIDES), new THREE.MeshLambertMaterial({ color: col }));
                    let studlb = new THREE.Mesh(new THREE.CylinderGeometry(width / 2, width / 2, height, this.STUD_NUM_SIDES), new THREE.MeshLambertMaterial({ color: col }));
                    let studrt = new THREE.Mesh(new THREE.CylinderGeometry(width / 2, width / 2, height, this.STUD_NUM_SIDES), new THREE.MeshLambertMaterial({ color: col }));
                    let studrb = new THREE.Mesh(new THREE.CylinderGeometry(width / 2, width / 2, height, this.STUD_NUM_SIDES), new THREE.MeshLambertMaterial({ color: col }));

                    studlt.position.y = (0.5) * this.LEGO_HEIGHT + (this.STUD_HEIGHT) / 2;
                    studlt.position.x = (this.STUD_WIDTH / 4 + this.STUD_PADDING + i * (this.STUD_WIDTH + this.STUD_SPACING) - x / 2) - space;
                    studlt.position.z = -(-z / 4 + this.STUD_WIDTH / 2 + this.STUD_PADDING + j * (this.STUD_WIDTH + this.STUD_SPACING));

                    studlb.position.y = (0.5) * this.LEGO_HEIGHT + (this.STUD_HEIGHT) / 2;
                    studlb.position.x = (this.STUD_WIDTH / 4 + this.STUD_PADDING + i * (this.STUD_WIDTH + this.STUD_SPACING) - x / 2) - space;
                    studlb.position.z = -(-z / 1.5 + this.STUD_WIDTH / 2 + this.STUD_PADDING + j * (this.STUD_WIDTH + this.STUD_SPACING));

                    studrt.position.y = (0.5) * this.LEGO_HEIGHT + (this.STUD_HEIGHT) / 2;
                    studrt.position.x = (this.STUD_WIDTH / 1.5 + this.STUD_PADDING + i * (this.STUD_WIDTH + this.STUD_SPACING) - x / 2) + space;
                    studrt.position.z = -(-z / 4 + this.STUD_WIDTH / 2 + this.STUD_PADDING + j * (this.STUD_WIDTH + this.STUD_SPACING));

                    studrb.position.y = (0.5) * this.LEGO_HEIGHT + (this.STUD_HEIGHT) / 2;
                    studrb.position.x = (this.STUD_WIDTH / 1.5 + this.STUD_PADDING + i * (this.STUD_WIDTH + this.STUD_SPACING) - x / 2) + space;
                    studrb.position.z = -(-z / 1.5 + this.STUD_WIDTH / 2 + this.STUD_PADDING + j * (this.STUD_WIDTH + this.STUD_SPACING));

                    cube.add(studlt);
                    cube.add(studlb);
                    cube.add(studrt);
                    cube.add(studrb);
                }
            }



            if (type == 'previous') {
                this.draw_borders(cube, x, z, "black", 4);
                this.previous = cube;

            } else if (type == 'current') {
                this.draw_borders(cube, x, z, col2, 1);
                this.current = cube;
            } else {
                this.draw_borders(cube, x, z, col2, 1);

            }
            this.scene.add(cube)

            return cube;

        }, 
        getColor(val){
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
        },
        get_dark_Color(val){
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
        }, 
        draw_borders(cube, x, z, color, width_){
            var basic_width = this.LEGO_HEIGHT / 40;

            var width = basic_width * width_;
            

            var geom1 = new THREE.BoxGeometry(x, width, width);
            var mat1 = new THREE.MeshBasicMaterial({ color: "black" });
            var cube1 = new THREE.Mesh(geom1, mat1);
            cube1.position.copy(new THREE.Vector3(0, 0, 0));
            cube1.position.y = cube1.position.y - this.LEGO_HEIGHT / 2;
            cube1.position.z = cube1.position.z + z / 2;
            cube.add(cube1);


            var geom2 = new THREE.BoxGeometry(x, width, width);
            var mat2 = new THREE.MeshBasicMaterial({ color: "black" });
            var cube2 = new THREE.Mesh(geom2, mat2);
            cube2.position.copy(new THREE.Vector3(0, 0, 0));
            cube2.position.y = cube2.position.y + this.LEGO_HEIGHT / 2;
            cube2.position.z = cube2.position.z + z / 2;
            cube.add(cube2);


            var geom3 = new THREE.BoxGeometry(x, width, width);
            var mat3 = new THREE.MeshBasicMaterial({ color: "black" });
            var cube3 = new THREE.Mesh(geom3, mat3);
            cube3.position.copy(new THREE.Vector3(0, 0, 0));
            cube3.position.y = cube3.position.y + this.LEGO_HEIGHT / 2;
            cube3.position.z = cube3.position.z - z / 2;
            cube.add(cube3);


            //var geom4 = new THREE.BoxGeometry(x, width, width);
            //var mat4 = new THREE.MeshBasicMaterial({ color: "black" });
            var cube4 = new THREE.Mesh(geom3, mat3);
            cube4.position.copy(new THREE.Vector3(0, 0, 0));
            cube4.position.y = cube4.position.y - this.LEGO_HEIGHT / 2;
            cube4.position.z = cube4.position.z - z / 2;
            cube.add(cube4);

            // 
            // 

            var geom_a = new THREE.BoxGeometry(width, width, z);
            var mat_a = new THREE.MeshBasicMaterial({ color: "black" });
            var cube_a = new THREE.Mesh(geom_a, mat_a);
            cube_a.position.copy(new THREE.Vector3(0, 0, 0));
            cube_a.position.x = cube_a.position.x - x / 2;
            cube_a.position.y = cube_a.position.y - this.LEGO_HEIGHT / 2;
            cube.add(cube_a);

            var geom_b = new THREE.BoxGeometry(width, width, z);
            var mat_b = new THREE.MeshBasicMaterial({ color: "black" });
            var cube_b = new THREE.Mesh(geom_b, mat_b);
            cube_b.position.copy(new THREE.Vector3(0, 0, 0));
            cube_b.position.x = cube_b.position.x - x / 2;
            cube_b.position.y = cube_b.position.y + this.LEGO_HEIGHT / 2;
            cube.add(cube_b);

            var geom_c = new THREE.BoxGeometry(width, width, z);
            var mat_c = new THREE.MeshBasicMaterial({ color: "black" });
            var cube_c = new THREE.Mesh(geom_c, mat_c);
            cube_c.position.copy(new THREE.Vector3(0, 0, 0));
            cube_c.position.x = cube_c.position.x + x / 2;
            cube_c.position.y = cube_c.position.y + this.LEGO_HEIGHT / 2;
            cube.add(cube_c);

            var geom_d = new THREE.BoxGeometry(width, width, z);
            var mat_d = new THREE.MeshBasicMaterial({ color: "black" });
            var cube_d = new THREE.Mesh(geom_d, mat_d);
            cube_d.position.copy(new THREE.Vector3(0, 0, 0));
            cube_d.position.x = cube_d.position.x + x / 2;
            cube_d.position.y = cube_d.position.y - this.LEGO_HEIGHT / 2;
            cube.add(cube_d);

            //
            //

            var geom_1 = new THREE.BoxGeometry(width, this.LEGO_HEIGHT, width);
            var mat_1 = new THREE.MeshBasicMaterial({ color: "black" });
            var cube_1 = new THREE.Mesh(geom_1, mat_1);
            cube_1.position.copy(new THREE.Vector3(0, 0, 0));
            cube_1.position.x = cube_1.position.x - x / 2;
            cube_1.position.z = cube_1.position.z + z / 2;
            cube.add(cube_1);

            var geom_2 = new THREE.BoxGeometry(width, this.LEGO_HEIGHT, width);
            var mat_2 = new THREE.MeshBasicMaterial({ color: "black" });
            var cube_2 = new THREE.Mesh(geom_2, mat_2);
            cube_2.position.copy(new THREE.Vector3(0, 0, 0));
            cube_2.position.x = cube_2.position.x - x / 2;
            cube_2.position.z = cube_2.position.z - z / 2;
            cube.add(cube_2);

            var geom_3 = new THREE.BoxGeometry(width, this.LEGO_HEIGHT, width);
            var mat_3 = new THREE.MeshBasicMaterial({ color: "black" });
            var cube_3 = new THREE.Mesh(geom_3, mat_3);
            cube_3.position.copy(new THREE.Vector3(0, 0, 0));
            cube_3.position.x = cube_3.position.x + x / 2;
            cube_3.position.z = cube_3.position.z + z / 2;
            cube.add(cube_3);

            var geom_4 = new THREE.BoxGeometry(width, this.LEGO_HEIGHT, width);
            var mat_4 = new THREE.MeshBasicMaterial({ color: "black" });
            var cube_4 = new THREE.Mesh(geom_4, mat_4);
            cube_4.position.copy(new THREE.Vector3(0, 0, 0));
            cube_4.position.x = cube_4.position.x + x / 2;
            cube_4.position.z = cube_4.position.z - z / 2;
            cube.add(cube_4);            
        },
        startExecution(){
            this.stop_robot = false;
            this.read_robot_input();
        },
        stopExecution(){

        }, 
        resetExecution(){

        }
    },
    mounted(){
        this.init();
    }
}
</script>

<style>
    #containerTable{
        position: absolute;
        width: 300px;
        height: 500px;
        top: 50%;
        left: 50%;
    }
</style>