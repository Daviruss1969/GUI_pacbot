
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
  addTableStuds(dim_x, dim_y, scene);
}

function addTableStuds(dim_x,dim_y, scene){
  x = computePlateLength(dim_x);
  y = computePlateLength(dim_y);
  for(var i=0; i<dim_x; i++){
    for(var j=0; j<dim_y; j++){
      stud = new THREE.Mesh(new THREE.CylinderGeometry(STUD_WIDTH/2, STUD_WIDTH/2, STUD_HEIGHT, STUD_NUM_SIDES), new THREE.MeshLambertMaterial({ color: 0x00b300 }));

      stud.position.y = PLATE_HEIGHT + STUD_HEIGHT/2
      stud.position.x = STUD_WIDTH / 2 + STUD_PADDING + i * (STUD_WIDTH + STUD_SPACING) - x/2
      stud.position.z = STUD_WIDTH / 2 + STUD_PADDING + j * (STUD_WIDTH + STUD_SPACING) - y/2

      scene.add(stud);
    }
  }
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

function add_LEGO(color, dim_x, dim_y, pos_x, pos_y, pos_z, scene, draggable, type) {
  x = computePlateLength(dim_x);
  z = computePlateLength(dim_y);
  col = getColor(color);
  var geometry = new THREE.BoxGeometry(x,LEGO_HEIGHT,z);
  if (type == "previous"){
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
  const init_pos_y = 195.6798407538288 - 70;
  const init_pos_z = 83.03738904083703 - 35;
  
  const init_rot_x = -1.2028291652806293;
  const init_rot_y = 0.0017060211432452725;
  const init_rot_z = 0.004425142911459734;

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);


  // in order to rotate the table

  // var orbit_controls = new THREE.OrbitControls(camera, renderer.domElement);
  // orbit_controls.addEventListener('change', orbitChange);
  // orbit_controls.addEventListener('end', orbitEnd);
  // orbit_controls.addEventListener('start', orbitStart);
  // orbit_controls.enabled = true;


  // LEGO table

  createFloor(FloorWidth,FloorHeight, scene);

  // light
  addLight(scene);

// adding the lego objects

function read_file(id, section) {
  var file = "";
  
  if (section == "mirror")
    file = "../data/mirrored_scenes.json";
  if (section == "original")
    file = "../data/scenes.json";

  console.log("file");
  console.log(file);


  fetch(file)
    .then(function(resp){
      return resp.json();
    })
    .then(function(data){
      // adding the lego on the scene
      console.log("id");
      console.log(id);
      console.log("section");
      console.log(section);
      add_objects(data, id, section)
    });
}

function add_objects(data, id, section) {

  for (let s of data){
    if (s.scene != id){
      continue;
    }

    for (let obj of s.table){
      dim = obj.dim;
      pos = obj.pos;
      color = obj.color;
      type = obj.type;

      add_LEGO(color, dim[0], dim[1], pos[0], pos[1], pos[2], scene, false, type);
    }
  }
}

// getting file scene
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
var id = urlParams.get('scene')
var section = urlParams.get('what')


// special lego objs
var current;
var previous;
var blink = "up";

// reading the file on the server
read_file(id, section);

function blink_effect() {
  // if (current.parent === scene) {
  //   scene.remove(current);
  // } else {
  //   scene.add(current);
  // }
  console.log("current")
  console.log(current)
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
  current.material.transparent = true;
  current.material.opacity =  t;

  for (let obj of current.children){
    obj.material.transparent = true;
    obj.material.opacity =  t;
  }
}





var myVar;

function render_animate_selected() {
  clearInterval(myVar);
  myVar = setInterval(function () {blink_effect()}, 800);
}

render_animate_selected();

  var dir = new THREE.Vector3();
  var sph = new THREE.Spherical();


  renderer.setAnimationLoop(() => {
    dragObject();
    renderer.render(scene, camera);
    camera.getWorldDirection(dir);
    sph.setFromVector3(dir);
  });


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

function onMouseMove( event ) {

  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  mouseMove.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouseMove.y = - ( event.clientY / window.innerHeight ) * 2 + 1;


}
function onMouseClick( event ) {

  if (draggable){
    console.log("holding nothing.");
    draggable = null;
    return;
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
  }
  else{
    console.log(found.length);
    console.log(objects);

  }
}

function dragObject(){
  if(draggable){
    raycaster.setFromCamera(mouseMove, camera);
    const found = raycaster.intersectObjects( scene.children );
  
    if (found.length > 0){
        if(mouse_on_table(found)){
          reposition(found);
        }
    }
  }
}

function reposition(found) {
  var drag_box = new THREE.Box3().setFromObject(draggable);
  draggable.position.y = PLATE_HEIGHT + LEGO_HEIGHT/2;

  for (let obj of all_obj){
    leg_obj = get_cube(obj);
    if (leg_obj == draggable)
      continue
    var obj_box = new THREE.Box3().setFromObject(leg_obj);

    collision = drag_box.intersectsBox(obj_box);

    if(collision){
      console.log("collision");
      draggable.position.y += LEGO_HEIGHT;
      draggable.position.x = found[0].point.x;
      draggable.position.z = found[0].point.z;
      reposition(found);
      return;
    }
    else{
      console.log("no collision");
    }
  }

  // reposition_down();

  draggable.position.x = found[0].point.x;
  draggable.position.z = found[0].point.z;
}

function reposition_down() {
  for (let obj of all_obj){
    leg_obj = get_cube(obj);
    if (leg_obj == draggable)
      continue
    var obj_box = new THREE.Box3().setFromObject(leg_obj);

    collision_drop = drag_box.intersectsBox(obj_box);

    if(collision_drop)
      break;
  }

  // if 
}

function mouse_on_table(found) {
  for (let o of found){
    if (o.object.userData.name == 'table'){
      console.log("mouse_on_table");
      
      return true;
    }
  }
  console.log("not mouse_on_table");

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
// end dragging

// start navigation orbit test

document.getElementById("top").addEventListener("click", function() {
  
  var new_rot_x = scene.rotation.x + Math.PI/10;
  var new_rot_y = scene.rotation.y;
  var new_rot_z = scene.rotation.z;

  scene.rotation.set(new_rot_x, new_rot_y, new_rot_z);
});

document.getElementById("bottom").addEventListener("click", function() {
  var new_rot_x = scene.rotation.x - Math.PI/10;
  var new_rot_y = scene.rotation.y;
  var new_rot_z = scene.rotation.z;

  scene.rotation.set(new_rot_x, new_rot_y, new_rot_z);

});

document.getElementById("right").addEventListener("click", function() {
  var new_rot_x = scene.rotation.x;
  var new_rot_y = scene.rotation.y - Math.PI/10;
  var new_rot_z = scene.rotation.z;

  compass.style.transform = `rotate(${-180*new_rot_y/Math.PI}deg)`;

  scene.rotation.set(new_rot_x, new_rot_y, new_rot_z);
});

document.getElementById("left").addEventListener("click", function() {
  var new_rot_x = scene.rotation.x;
  var new_rot_y = scene.rotation.y + Math.PI/10;
  var new_rot_z = scene.rotation.z;

  compass.style.transform = `rotate(${-180*new_rot_y/Math.PI}deg)`;

  scene.rotation.set(new_rot_x, new_rot_y, new_rot_z);
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

document.getElementById("move_left").addEventListener("click", function() {
  var new_pos_x = camera.position.x - 40;
  var new_pos_y = camera.position.y;
  var new_pos_z = camera.position.z;

  camera.position.set(new_pos_x, new_pos_y, new_pos_z);

});

document.getElementById("move_right").addEventListener("click", function() {
  var new_pos_x = camera.position.x + 40;
  var new_pos_y = camera.position.y;
  var new_pos_z = camera.position.z;

  camera.position.set(new_pos_x, new_pos_y, new_pos_z);

});


camera.position.set(init_pos_x, init_pos_y, init_pos_z);
camera.rotation.set(init_rot_x, init_rot_y, init_rot_z);

// end navigation orbit test


