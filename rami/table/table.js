var initiali

function addLight(scene){
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
  var geometry = new THREE.BoxGeometry(x,PLATE_HEIGHT,y);
  var material = new THREE.MeshBasicMaterial({color: 0x00b300});
  var table = new THREE.Mesh(geometry,material);

  table.userData.name = 'table';

  scene.add(table);
  return addTableStuds(dim_x, dim_y, scene);
}

function addTableStuds(dim_x,dim_y, scene){
  x = computePlateLength(dim_x);
  y = computePlateLength(dim_y);
  
  stud_levels = [];

  for(var i=0; i<dim_x; i++){
    stud_levels.push([]);
    for(var j=0; j<dim_y; j++){
      stud = new THREE.Mesh(new THREE.CylinderGeometry(STUD_WIDTH/2, STUD_WIDTH/2, STUD_HEIGHT, STUD_NUM_SIDES), new THREE.MeshLambertMaterial({ color: 0x00b300 }));

      stud.position.y = PLATE_HEIGHT + STUD_HEIGHT/2
      stud.position.x = STUD_WIDTH / 2 + STUD_PADDING + i * (STUD_WIDTH + STUD_SPACING) - x/2
      stud.position.z = STUD_WIDTH / 2 + STUD_PADDING + j * (STUD_WIDTH + STUD_SPACING) - y/2

      stud_levels[i].push(0);
      stud.userData.id = i+"_"+j;

      scene.add(stud);
      table_studs.push(stud);
    }
  }
  return stud_levels;
}

function getColor(val){
  var codes={
    black:  0x191a1b,
    white:  0xfafafa,
    green:  0x00b300,
    red:    0xd10000,
    blue:   0x003399,
    yellow: 0xe6e600,
    olive:  0x808000,
    light_green: 0x90EE90,
    grey: 0x808080
  }
  return codes[val];
}

function get_dark_Color(val){
  var codes={
    black:  0x191a1b,
    white:  0xfafafa,
    green:  0x0D930D,
    red:    0xC31E1E,
    blue:   0x0C1F7F,
    yellow: 0xD2DA1D,
    olive:  0x556B2F,
    light_green: 0x8FBC8F
  }
  return codes[val];
}

function AddToGeometry(mainObject, objectToAdd) { 
  var combined = new THREE.BufferGeometry();

  THREE.GeometryUtils.merge( combined, mainObject );
  THREE.GeometryUtils.merge( combined, objectToAdd );

  var mesh = new THREE.Mesh( combined, new THREE.MeshBasicMaterial( { color: 0xff0000 } ) );
  return mesh ;
}

function update_stud_levels_from_file(below_left, dim_x, dim_y) {
  for (let i = below_left[0]; i < below_left[0] + dim_x; i++) 
    for (let j = below_left[1] - dim_y + 1; j <= below_left[1]; j++) 
      stud_levels[i][j] += 1;

}

function add_LEGO(color, dim_x, dim_y, pos_x, pos_y, pos_z, scene, draggable, type, update_stud_levels = true, fromCube = false ) {
  x = computePlateLength(dim_x);
  z = computePlateLength(dim_y);
  if (typeof color === "string"){
    col = getColor(color);
  } else{
    col = color;
  }
  var geometry = new THREE.BoxGeometry(x,LEGO_HEIGHT,z);

  if (type != "current"){
    var material = new THREE.MeshBasicMaterial(
      {color: col,
      opacity: 1,
      transparent: false}
      );
  }
  else{
    var material = new THREE.MeshBasicMaterial({color: col});

  }
  var cube = new THREE.Mesh(geometry,material);
  if (fromCube){
    cube.position.y = pos_y;
    cube.position.x = pos_x;
    cube.position.z = pos_z; 
  } else{
    cube.position.y = (0.5 + pos_z)*LEGO_HEIGHT + PLATE_HEIGHT;
    cube.position.x = computePlateLength(pos_x) + x/2;
    cube.position.z = -computePlateLength(pos_y) - z/2; 
  }


  cube.userData.name = dim_x + 'x' + dim_y + '_' + color;

  // adding the lines surrounding the lego
  col2 = get_dark_Color(color);

  var geo = new THREE.EdgesGeometry( cube.geometry );
  var mat = new THREE.LineBasicMaterial( { color: col2, linewidth: 4 } );
  var wireframe = new THREE.LineSegments( geo, mat );
  wireframe.renderOrder = 2; // make sure wireframes are rendered 2nd
  cube.add( wireframe );

  var all_studs = [];

  const c_x = cube.position.x;
  const c_y = cube.position.y;
  const c_z = cube.position.z;


  // adding the studs
  for(var i=0; i<dim_x; i++){
    for(var j=0; j<dim_y; j++){
      stud = new THREE.Mesh(new THREE.CylinderGeometry(STUD_WIDTH/2, STUD_WIDTH/2, STUD_HEIGHT, STUD_NUM_SIDES), new THREE.MeshLambertMaterial({ color: col }));

      stud.position.y = (0.5)*LEGO_HEIGHT + (STUD_HEIGHT)/2 + PLATE_HEIGHT;
      stud.position.x = (STUD_WIDTH / 2 + STUD_PADDING + i * (STUD_WIDTH + STUD_SPACING) - x/2);
      stud.position.z = - (- z/2 + STUD_WIDTH / 2 + STUD_PADDING + j * (STUD_WIDTH + STUD_SPACING) );

      cube.add(stud);
    }
  }

  if (type == 'previous'){
    draw_borders(cube, x, z, "black", 4);
    previous = cube;

  }
  else if (type == 'current'){
    draw_borders(cube, x, z, col2, 1);
    current = cube;
  }
  else{
    draw_borders(cube, x, z, col2, 1);

  }

  if (draggable){
    objects.push(cube);
  }

  scene.add(cube);

  if (update_stud_levels){
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

    var basic_width = LEGO_HEIGHT/40;

    var width = basic_width * width;

    var geom1 = new THREE.BoxGeometry(x,width,width);
    var mat1 = new THREE.MeshBasicMaterial({color: "black"});
    var cube1 = new THREE.Mesh(geom1,mat1);
    cube1.position = cube.position;
    cube1.position.y = cube1.position.y - LEGO_HEIGHT/2;
    cube1.position.z = cube1.position.z + z/2;
    cube.add(cube1);


    var geom2 = new THREE.BoxGeometry(x,width,width);
    var mat2 = new THREE.MeshBasicMaterial({color: "black"});
    var cube2 = new THREE.Mesh(geom2,mat2);
    cube2.position = cube.position;
    cube2.position.y = cube2.position.y + LEGO_HEIGHT/2;
    cube2.position.z = cube2.position.z + z/2;
    cube.add(cube2);


    var geom3 = new THREE.BoxGeometry(x,width,width);
    var mat3 = new THREE.MeshBasicMaterial({color: "black"});
    var cube3 = new THREE.Mesh(geom3,mat3);
    cube3.position = cube.position;
    cube3.position.y = cube3.position.y + LEGO_HEIGHT/2;
    cube3.position.z = cube3.position.z - z/2;
    cube.add(cube3);


    var geom4 = new THREE.BoxGeometry(x,width,width);
    var mat4 = new THREE.MeshBasicMaterial({color: "black"});
    var cube4 = new THREE.Mesh(geom3,mat3);
    cube4.position = cube.position;
    cube4.position.y = cube4.position.y - LEGO_HEIGHT/2;
    cube4.position.z = cube4.position.z - z/2;
    cube.add(cube4);

    // 
    // 

    var geom_a = new THREE.BoxGeometry(width,width,z);
    var mat_a = new THREE.MeshBasicMaterial({color: "black"});
    var cube_a = new THREE.Mesh(geom_a,mat_a);
    cube_a.position = cube.position;
    cube_a.position.x = cube_a.position.x - x/2;
    cube_a.position.y = cube_a.position.y - LEGO_HEIGHT/2;
    cube.add(cube_a);

    var geom_b = new THREE.BoxGeometry(width,width,z);
    var mat_b = new THREE.MeshBasicMaterial({color: "black"});
    var cube_b = new THREE.Mesh(geom_b,mat_b);
    cube_b.position = cube.position;
    cube_b.position.x = cube_b.position.x - x/2;
    cube_b.position.y = cube_b.position.y + LEGO_HEIGHT/2;
    cube.add(cube_b);

    var geom_c = new THREE.BoxGeometry(width,width,z);
    var mat_c = new THREE.MeshBasicMaterial({color: "black"});
    var cube_c = new THREE.Mesh(geom_c,mat_c);
    cube_c.position = cube.position;
    cube_c.position.x = cube_c.position.x + x/2;
    cube_c.position.y = cube_c.position.y + LEGO_HEIGHT/2;
    cube.add(cube_c);

    var geom_d = new THREE.BoxGeometry(width,width,z);
    var mat_d = new THREE.MeshBasicMaterial({color: "black"});
    var cube_d = new THREE.Mesh(geom_d,mat_d);
    cube_d.position = cube.position;
    cube_d.position.x = cube_d.position.x + x/2;
    cube_d.position.y = cube_d.position.y - LEGO_HEIGHT/2;
    cube.add(cube_d);

    //
    //

    var geom_1 = new THREE.BoxGeometry(width,LEGO_HEIGHT,width);
    var mat_1 = new THREE.MeshBasicMaterial({color: "black"});
    var cube_1 = new THREE.Mesh(geom_1,mat_1);
    cube_1.position = cube.position;
    cube_1.position.x = cube_1.position.x - x/2;
    cube_1.position.z = cube_1.position.z + z/2;
    cube.add(cube_1);

    var geom_2 = new THREE.BoxGeometry(width,LEGO_HEIGHT,width);
    var mat_2 = new THREE.MeshBasicMaterial({color: "black"});
    var cube_2 = new THREE.Mesh(geom_2,mat_2);
    cube_2.position = cube.position;
    cube_2.position.x = cube_2.position.x - x/2;
    cube_2.position.z = cube_2.position.z - z/2;
    cube.add(cube_2);

    var geom_3 = new THREE.BoxGeometry(width,LEGO_HEIGHT,width);
    var mat_3 = new THREE.MeshBasicMaterial({color: "black"});
    var cube_3 = new THREE.Mesh(geom_3,mat_3);
    cube_3.position = cube.position;
    cube_3.position.x = cube_3.position.x + x/2;
    cube_3.position.z = cube_3.position.z + z/2;
    cube.add(cube_3);

    var geom_4 = new THREE.BoxGeometry(width,LEGO_HEIGHT,width);
    var mat_4 = new THREE.MeshBasicMaterial({color: "black"});
    var cube_4 = new THREE.Mesh(geom_4,mat_4);
    cube_4.position = cube.position;
    cube_4.position.x = cube_4.position.x + x/2;
    cube_4.position.z = cube_4.position.z - z/2;
    cube.add(cube_4);
}

// adding, from saved data, the lego objects
function read_file(id, section) {
  const file = "../data/scenes.json";

  fetch(file)
    .then(function(resp){
      return resp.json();
    })
    .then(function(data){
      add_objects(data, id, section)
    });
}

function add_objects(data, id, section) {


  data = [{
    "scene":2,
    "section":"data",
    "radio":true,
    "text":true,
    "table":[
      {"dim":[6,2,1],"pos":[4,0,0], "color":"yellow", "type":"other"},
      {"dim":[6,2,1],"pos":[-2,-2,0], "color":"red", "type":"previous"}
    ]
  }]

  for (let s of data){
    for (let obj of s.table){
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
  if (current){
    var t = current.material.opacity;

    if (t == 1)
      blink = "down";

    if (t == 0.5)
      blink = "up";

    if (blink == 'up'){
      t = 2*t;
    }
    else{
      t = t/2;
    }

    for (let obj of current.children){
      obj.material.transparent = true;
      obj.material.opacity =  t;
    }

    current.material.transparent = true;
    current.material.opacity =  t;
  }
}

function render_animate_selected() {
  clearInterval(myVar);
  myVar = setInterval(function () {blink_effect()}, 800);
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
  var STUD_WIDTH = 4.8;
  var STUD_SPACING = 3.2;
  var PLATE_HEIGHT = 0.5;
  var STUD_HEIGHT = 1.7;
  var STUD_PADDING = STUD_WIDTH / 3.2; // table sides
  var STUD_NUM_SIDES = 32;
  var LEGO_HEIGHT = 9.6;
  var FloorWidth = 48;
  var FloorHeight = 24;

  // table positions
  var MIN_X = - computePlateLength(24);
  var MIN_Y = - computePlateLength(12);
  var MAX_X = computePlateLength(24);
  var MAX_Y = computePlateLength(12);

  var objects = [];

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  

  const init_pos_x = -1.902388126728884;
  const init_pos_y = 195.6798407538288;
  const init_pos_z = 83.03738904083703;
  
  const init_rot_x = -1.2028291652806293;
  const init_rot_y = 0.0017060211432452725;
  const init_rot_z = 0.004425142911459734;

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // LEGO table
  table_studs = [];
  stud_levels = createFloor(FloorWidth,FloorHeight, scene);
  var latest_stud;


  // light
  addLight(scene);

// this legos array contains the informations of the top legos in x,y coordinate
var legos = new Map();



  var isInStock = false;
  var isInNav = false;

  // stocks = ["stock_panel", "objects", "colors", "orientation", "representation"];
  // navs = ["nav_panel", "rotate", "top", "bottom", "left", "right", "middle", "zoom_panel", "zoom_in", "zoom_out"];

  // for (let elt in stocks){
  //   document.getElementById(stocks[elt]).addEventListener("mouseenter", function(  ) {isInStock=true;});
  //   document.getElementById(stocks[elt]).addEventListener("mouseout", function(  ) {isInStock=false;});
  // }
  
  // for (let elt in navs){
  //   document.getElementById(navs[elt]).addEventListener("mouseenter", function(  ) {isInNav=true;});
  //   document.getElementById(navs[elt]).addEventListener("mouseout", function(  ) {isInNav=false;});
  // }

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
// 


// getting file scene
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
var id = urlParams.get('scene')
var section = urlParams.get('what')

// special lego objs
var oldCurrent;
var current;
var previous;
var blink = "up";



//getting the correct data of the robot
function read_robot_input(file = "../data/data.json"){

  let update = false;
  //get the json file and parse it
  fetch(file).then(function(resp){
    return resp.json();
  }).then(function(data){

    //Iterate trought object receive
    Object.keys(data).forEach(key =>{

      //Split for the position
      let char = key.split('');

      //get the position of the current lego
      let position = {
        x : parseInt(char[5]+char[6]) - FloorWidth / 2,
        y : -(parseInt(char[2]+char[3]) - FloorHeight / 2),
        z : parseInt(data[key][1])
      }

      // 2 case if there is no legos at x,y coords or if there is one more legos in the x,y coords
      if (legos.get(key) == undefined || JSON.stringify(legos.get(key)["position"]) != JSON.stringify(position)){
        //Choose the color
        let color;
        switch(data[key][0]){
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
        
        //Type of the lego - basic is other
        let type;
        type = "other";
        

        if (legos.get(key) == undefined){
          //Create an lego with the informations
          var lego = {
            type: type,
          
            position : position,
          
            color : color          
          }

                  
          //add to the vector
          legos.set(key, lego);
        }else{
          //update the top lego
          type = "current";
          legos.get(key)["type"] = type;
          legos.get(key)["position"] = position;
          legos.get(key)["color"] = color;

          //if there is two piece, it show only animation for the last one, TODO : se mettre d'accord avec belal sur la gestion de la prochaine piece du robot 
          if (update){
            type = "other";
          } else{ // sinon on update l'affichage
            update = true;
            updateLegos();
          }
          
        }

        //we add the lego to the scene
        let tmp = add_LEGO(legos.get(key)["color"], 
        1, 
        1, 
        legos.get(key)["position"]["x"], 
        legos.get(key)["position"]["y"], 
        legos.get(key)["position"]["z"], 
        scene, 
        false, 
        legos.get(key)["type"]);
      }
    });
  })
}

//this function has to change the current and the previous lego to the right ones
function updateLegos(){

  //if there is a previous one 
  if (previous != undefined){

    //get the name of the color with the function
    let color = previous["material"]["color"];
    color = colorNameFromTreeJSColors(color);

    //get position
    let x = previous["position"]["x"];
    let y = previous["position"]["y"];
    let z = previous["position"]["z"];
  
    //add the same lego but wit different type
    add_LEGO(color,
    1,
    1,
    x,
    y,
    z,
    scene,
    false,
    "other",
    false,
    true);
  
    //remove the old one
    remove_LEGO(previous);

  }

  //if we have a current lego
  if (current != undefined){
    //we take the old current and all of the information
    oldCurrent = current;
    let color = oldCurrent["material"]["color"];

    

    color = colorNameFromTreeJSColors(color);
    x = oldCurrent["position"]["x"];
    y = oldCurrent["position"]["y"];
    z = oldCurrent["position"]["z"];
  
    previous = add_LEGO(color,
    1,
    1,
    x,
    y,
    z,
    scene,
    false,
    "previous",
    false,
    true);

    //we make it transparent
    oldCurrent.material.transparent = true;
    oldCurrent.material.opacity =  0.5;

    //run the animation for the grip, when the grip as finished
    //we destroy the old current lego and call the read robot input funtion in order
    //to actualize the legos
    gripPrevious();
  }else{
    //here we actualize the lego if there is no animation to run
    //for now it's testing time but then I have just to call read_robot_input();
    test();
  }




}
//what i'm not sure :
//the color will always work ?
//the fact that I set something to false above will always work ?

/* 
  this function take a color in entrie like this :
    R : 0.9
    G : 0
    B : 0.7364
  and check the correspondance to return the good color name
*/
function colorNameFromTreeJSColors(color){

  //get the colors string defined clearely:
  let calc = color["r"].toFixed(3).toString()+'-'+color["g"].toFixed(3).toString()+'-'+color["b"].toFixed(3).toString();

  //test the combinaison
  if (calc == "0.502-0.502-0.000"){ //olive
    return "olive";
  }else if (calc == "0.820-0.000-0.000"){ //red
    return "red";
  }else if (calc == "0.902-0.902-0.000") { //yellow
    return "yellow";
  }else if (calc == "0.000-0.702-0.000"){ // green
    return "green";
  }else if (calc == "0.000-0.200-0.600"){ //blue
    return "blue"; 
  }else if (calc == "0.565-0.933-0.565"){ //light green
    return "light_green";
  }else{ //others
    return "black";
  }
}

var myVar;

//for the initialisation we run a first input
read_robot_input();

//for testing I need a little delay who can be remove when this is finish
setTimeout(function(){
  test();
}, 3000)


render_animate_selected(); 

  var dir = new THREE.Vector3();
  var sph = new THREE.Spherical();


  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
    camera.getWorldDirection(dir);
    sph.setFromVector3(dir);
  });

var id;


function add_gripper(color, pos, orientation, scene) {

  col = getColor(color);

  pole_height = LEGO_HEIGHT*30;

  var pole_geometry = new THREE.BoxGeometry(STUD_WIDTH*0.4,pole_height,STUD_WIDTH*0.4);
  var pole_material = new THREE.MeshBasicMaterial({color: col});
  var pole = new THREE.Mesh(pole_geometry,pole_material);
  pole.position.y = pos.y + LEGO_HEIGHT/2 + pole_height/2;
  pole.position.x = pos.x;
  pole.position.z = pos.z;
  pole.userData.name = "pole";


  // children

  var base_geometry = new THREE.BoxGeometry(STUD_WIDTH,STUD_HEIGHT/2,STUD_WIDTH);
  var base_material = new THREE.MeshBasicMaterial({color: col});
  var base = new THREE.Mesh(base_geometry,base_material);
  base.position.y = pos.y - pole.position.y + STUD_WIDTH ;
  base.position.x = pos.x - pole.position.x;
  base.position.z = pos.z - pole.position.z;
  base.userData.name = "base";

  // grippers

  cub_size = STUD_SPACING + 2*(STUD_PADDING+STUD_WIDTH);

  var grip_right_geometry = new THREE.BoxGeometry(1.5*cub_size,STUD_HEIGHT,0.5*STUD_WIDTH);
  var grip_right_material = new THREE.MeshBasicMaterial({color: col});
  var grip_right = new THREE.Mesh(grip_right_geometry,grip_right_material);
  grip_right.position.y = pos.y - pole.position.y + 1.5*STUD_WIDTH ;
  grip_right.position.x = pos.x - pole.position.x;
  grip_right.position.z = pos.z - pole.position.z;
  grip_right.rotation.set(0, Math.PI/4, 0);
  grip_right.userData.name = "grip_right";


  var grip_left = new THREE.Mesh(grip_right_geometry,grip_right_material);
  grip_left.position.y = pos.y - pole.position.y + 1.5*STUD_WIDTH ;
  grip_left.position.x = pos.x - pole.position.x;
  grip_left.position.z = pos.z - pole.position.z;
  grip_left.rotation.set(0, -Math.PI/4, 0);
  grip_left.userData.name = "grip_left";


  // adding to pole
  pole.add(grip_right);
  pole.add(grip_left);
  pole.add(base);


  // adding to scene
  scene.add(pole);

  return pole;
}



// POUR LE GRIP 
var prev_OG;
var grip;
var gripper_OG;
var speed = 1.7;
var distance_beg = 13;


function animate_down() {

    id = requestAnimationFrame( animate_down );

    renderer.render( scene, camera );


    if (previous.position.y <= prev_OG.y){
      previous.position.y = prev_OG.y;
      cancelAnimationFrame( id );
      animate_up();
    }
    else{
      previous.position.y -= prev_OG.y/speed;
      gripper.position.y -= prev_OG.y/speed;
    }

}

function animate_up() {
    id = requestAnimationFrame( animate_up );

    renderer.render( scene, camera );


    if (gripper.position.y >= gripper_OG.y){
      
      cancelAnimationFrame( id );    

      //remove the gripper
      scene.remove(gripper);

      //remove the old current
      remove_LEGO(oldCurrent);

      //actualize legos
      test(); //for now it's testing time but then I have just to call read_robot_input();
    }
    else{
      gripper.position.y += prev_OG.y/speed;
    }

}

function gripPrevious(){

  //get the position of the previous lego
  prev_OG = Object();
  Object.assign(prev_OG, previous.position);
  
  //add a gripper at the right place
  gripper = add_gripper("grey", prev_OG, "horizontal", scene);
  
  
  previous.position.y *= distance_beg;
  gripper.position.y += (previous.position.y - prev_OG.y);
  
  gripper_OG = Object();
  Object.assign(gripper_OG, gripper.position);
  animate_down();
} 

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
  document.addEventListener("wheel", function(){
    //wheel goes up or down
    if (event.deltaY > 0){
      var new_pos_x = camera.position.x;
      var new_pos_y = camera.position.y + 10;
      var new_pos_z = camera.position.z + 5;
  
      camera.position.set(new_pos_x, new_pos_y, new_pos_z);
    }else{
      var new_pos_x = camera.position.x;
      var new_pos_y = camera.position.y - 10;
      var new_pos_z = camera.position.z - 5;
  
      camera.position.set(new_pos_x, new_pos_y, new_pos_z);
    }
  });

  document.addEventListener("keydown", function(event){
    let dX = 0;
    let dZ = 0;
    switch(event.key){
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




var iterator = 2;
//function for test
function test(){
  file = '../data/data'+iterator+".json";
  read_robot_input(file);
  if (iterator < 4){
    iterator++;    
  } 
}
