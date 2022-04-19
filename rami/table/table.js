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
    yellow: 0xe6e600
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
    yellow: 0xD2DA1D
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

function add_LEGO(color, dim_x, dim_y, pos_x, pos_y, pos_z, scene, draggable, type, update_stud_levels = true ) {
  x = computePlateLength(dim_x);
  z = computePlateLength(dim_y);
  col = getColor(color);
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
  cube.position.y = (0.5 + pos_z)*LEGO_HEIGHT + PLATE_HEIGHT;
  cube.position.x = computePlateLength(pos_x) + x/2;
  cube.position.z = -computePlateLength(pos_y) - z/2;


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

// adding the lego object
var legos = new Array();



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
var current;
var previous;
var blink = "up";



//getting the correct data of the robot
function read_robot_input(){

  //get the json file and parse it
  var file = "../data/data.json";
  fetch(file).then(function(resp){
    return resp.json();
  }).then(function(data){
    
    //Iterate trought object receive
    for (let i = 0; i < Object.keys(data).length; i++){

      //if the case isn't define
      if (legos[i] == undefined){

        //Choose the color
        let color;
        switch(data[i][1]){
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
          default:
            color = "blue";
            break;
        }

        //Split for the position
        let char = data[i][0].split('');

        //Type of the lego
        let type;
        if (i == Object.keys(data).length - 1){
          type = "current";
        } else if (i == Object.keys(data).length - 2){
          type = "previous"
        }else{
          type = "other";
        }

        if (i == 0){
          type = "current";
        }

        //Create an lego with the informations
        let lego = {
          type: type,

          position : {
            x : parseInt(char[5]+char[6]) - FloorWidth / 2,
            y : -(parseInt(char[2]+char[3]) - FloorHeight / 2),
            z : parseInt(data[i][2])
          },

          color : color          
        }

        //add to the vector
        legos.push(lego);
      }else{
        
      }

      



      //we add the lego
      add_LEGO(legos[i]["color"], 
              1, 
              1, 
              legos[i]["position"]["x"], 
              legos[i]["position"]["y"], 
              legos[i]["position"]["z"], 
              scene, 
              false, 
              legos[i]["type"]);
    }
  })
}

var myVar;

read_robot_input();
render_animate_selected(); 
//add_objects(1,2,3); //TODO to implemente the arm, uncomment this ligne and ligne 699 to 711

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


function animate_down() {

    id = requestAnimationFrame( animate_down );

    renderer.render( scene, camera );


    if (previous.position.y <= prev_OG.y){
      previous.position.y = prev_OG.y;
      cancelAnimationFrame( id );
      animate_up();
    }
    else{
      previous.position.y -= prev_OG.y/2;
      gripper.position.y -= prev_OG.y/2;
    }

}

function animate_up() {
    id = requestAnimationFrame( animate_up );

    renderer.render( scene, camera );


    if (gripper.position.y >= gripper_OG.y){
      cancelAnimationFrame( id );
    }
    else{
      gripper.position.y += prev_OG.y/2;
    }

}

/*var prev_OG = Object();
Object.assign(prev_OG, previous.position);

var gripper = add_gripper("grey", prev_OG, "horizontal", scene);


previous.position.y *= 25;
gripper.position.y += (previous.position.y - prev_OG.y);

var gripper_OG = Object();
Object.assign(gripper_OG, gripper.position);

animate_down();*/

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
// 
// start dragging

  const raycaster = new THREE.Raycaster();
  const mouseClick = new THREE.Vector2();
  const mouseMove = new THREE.Vector2();
  var draggable = null;

  var holding = false;

  // console.log(table_studs);

  function toScreenPosition(obj, camera)
    {
      var vector = new THREE.Vector3();

      var widthHalf = 0.5*renderer.context.canvas.width;
      var heightHalf = 0.5*renderer.context.canvas.height;

      obj.updateMatrixWorld();
      vector.setFromMatrixPosition(obj.matrixWorld);
      vector.project(camera);

      vector.x = ( vector.x * widthHalf ) + widthHalf;
      vector.y = - ( vector.y * heightHalf ) + heightHalf;

      return { 
          x: vector.x,
          y: vector.y
      };

  };

  function onMouseMove( event ) {

    if (isInNav || isInStock)
      return;

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouseMove.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouseMove.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    

    
    if (draggable){
      min_stud = null;
      minDist = Infinity;


      mouse_x = event.clientX;
      mouse_y = event.clientY;

      for (let stud of table_studs){
        stud_2d_pos = toScreenPosition(stud, camera);
        newDist = Math.pow(stud_2d_pos.x - mouse_x,2) + Math.pow(stud_2d_pos.y - mouse_y,2);
        if (newDist < minDist){
          minDist = newDist;
          min_stud = stud;
          min_stud_2d_pos = stud_2d_pos;
        }
      }
      latest_stud = dragObject(min_stud);
    }
  }

  function update_stud_levels(stud, dim, num) {

    var id = stud.userData.id;
    var words = id.split('_');
    var id_x = parseInt(words[0]);
    var id_y = parseInt(words[1]);

    click_x = (dim[0]/2)-1;
    click_y = (dim[1]/2)-1;

    for (let i = id_x - click_x; i < id_x + parseInt(dim[0]) - click_x; i++) {
      for (let j = id_y - click_y; j < id_y + parseInt(dim[1]) - click_y; j++) {
        if (i>=0 && j>=0){
          stud_levels[i][j] += num;
        }
      }
    }

  }

  function onMouseClick( event ) {
    if (isInNav || isInStock)
      return;

    raycaster.setFromCamera(mouseMove, camera);
    var f = raycaster.intersectObjects( scene.children );
    if (mouse_on_table(f)){
      if (draggable){
        // this is where we are letting go of the object
        draggable = null;

        var dim = draggable.userData.name.split("_")[0].split("x");
        update_stud_levels(latest_stud, [parseInt(dim[0]), parseInt(dim_y[1])], 1);

        return;
      }
    }

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouseClick.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouseClick.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera( mouseClick, camera );

    const found = raycaster.intersectObjects( scene.children );


    if (found.length > 0 && objects.includes(found[0].object)){
      draggable = found[0].object;
      console.log(draggable.userData.name);
      var dim = draggable.userData.name.split("_")[0].split("x");
      update_stud_levels(latest_stud, [parseInt(dim[0]), parseInt(dim_y[1])], -1);

    }
    else{
      // console.log(found.length);
      // console.log(objects);

    }
  }

  function get_under_obj_studs(stud, dim) {
    var studs = [];
    var ids = [];

    var id = stud.userData.id;
    var words = id.split('_');
    var id_x = parseInt(words[0]);
    var id_y = parseInt(words[1]);

    click_x = (dim[0]/2)-1;
    click_y = (dim[1]/2)-1;


    for (let i = id_x - click_x; i < id_x + parseInt(dim[0]) - click_x; i++) {
      for (let j = id_y - parseInt(dim[1]) + click_y + 1; j <= id_y + click_y; j++) {
        if (i>=0 && j>=0){
          console.log(i);
          console.log(j);
          studs.push(stud_levels[i][j]);
          ids.push(i+"_"+j);
        }
      }
    }

    console.log("ids");
    console.log(ids);

    return studs
  }

  function get_studs_from_ids(ids) {
    var studs = [];
    for (let id of table_studs){
      if (ids.includes(stud.userData.id)){
        studs.push(stud);
      }
    }
    return studs;
  }

  function dragObject(stud){
    if(draggable){
      raycaster.setFromCamera(mouseMove, camera);
      const found = raycaster.intersectObjects( scene.children );
    
      if (mouse_on_table(found)){
        reposition(draggable, stud);
      }
    }
  }

  function reposition(draggable, stud) {
    draggable.position.x = stud.position.x + (STUD_PADDING + STUD_WIDTH/2);
    draggable.position.z = stud.position.z - (STUD_PADDING + STUD_WIDTH/2);

    dim = draggable.userData.name.split("_")[0].split("x");
    studs = get_under_obj_studs(stud, dim)

    console.log("studs");
    console.log(studs);
    level = get_max_level_below(studs)

    console.log("level");
    console.log(level);

    draggable.position.y = (0.5 + level)*LEGO_HEIGHT + PLATE_HEIGHT;
    console.log("end reposition");  
  }

  function get_max_level_below(studs) {
    var max = 0;
    for (let lvl of studs){
      if (lvl > max)
        max = lvl;
    }
    return max; 
  }

  function mouse_on_table(found) {
    for (let o of found){
      if (o.object.userData.name == 'table'){
        return true;
      }
    }
    return false;
  }

  function get_cube(obj) {
    parent = obj.parent;
    
    // cube and not studs
    if (parent == scene){
      return obj;
    }

    return parent;
  }

  window.addEventListener( 'click', onMouseClick, true );
  window.addEventListener( 'mousemove', onMouseMove, true );


// end dragging


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

// end navigation orbit

// start new object creation
  var created = null;

  // document.getElementById("representation").addEventListener("click", function() {
  //   scene.remove(current);
  //   if (created != null)
  //     remove_LEGO(created);
  //   created = add_LEGO(selected.color, selected.dim[0], selected.dim[1], selected.pos[0], selected.pos[1], selected.pos[2], scene, true, "current", false);
  // });

// end new object creation

camera.position.set(init_pos_x, init_pos_y, init_pos_z);
camera.rotation.set(init_rot_x, init_rot_y, init_rot_z);
