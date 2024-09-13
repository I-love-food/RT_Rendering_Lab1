const Color = {
    RED: [1, 0, 0],
    GREEN: [0, 1, 0],
    BLUE: [0, 0, 1],
    DEFAULT: [1, 1, 0]
};

color = Color.RED
FLOAT_SIZE = 4
circle_density=200 // specify how many points to form a circle
max_depth = 100000.0;
depth = max_depth
step = 1.0
shape_spec = ['p','h','v','t','q','R']
color_spec = ['r', 'g', 'b']
next_shape = null

const height_text = document.getElementById('height');
const width_text = document.getElementById('width');
const col_text = document.getElementById('color');
const shape_text = document.getElementById('shape');
canvas = document.querySelector("#c");
height_text.textContent = canvas.height
width_text.textContent = canvas.width

gl = canvas.getContext("webgl");
if (!gl) {
    alert("WebGL is not supported.")
}

vertex_shader = create_shader(gl, gl.VERTEX_SHADER, vertex_shader_code);
fragment_shader = create_shader(gl, gl.FRAGMENT_SHADER, fragment_shader_code);
program = create_program(gl, vertex_shader, fragment_shader);

position_loc = gl.getAttribLocation(program, "a_position")
color_loc = gl.getAttribLocation(program, "a_color")
ratio_loc = gl.getUniformLocation(program, 'ratio');

gl.enableVertexAttribArray(position_loc);
gl.enableVertexAttribArray(color_loc);

shapes = ["points", "circles", "triangles", "squares", "lines"]
shape_dict = {}

shapes.forEach(shape => {
    shape_dict[shape] = {"VBO": gl.createBuffer(), "data": []}
});

function add_point(data){
    depth -= step;
    shape_dict["points"]["data"].push([data, depth / max_depth, color]);
    cnt = shape_dict["points"]["data"].length;
    gl.bindBuffer(gl.ARRAY_BUFFER, shape_dict["points"]["VBO"]);
    gl.bufferData(gl.ARRAY_BUFFER, 6 * FLOAT_SIZE * cnt, gl.DYNAMIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(shape_dict["points"]["data"].flat(Infinity)));
}

function add_circle(center, radius=0.1){
    depth -= step;
    two_pi = 2 * Math.PI;
    data = []
    for(i = 0; i < circle_density; i ++){
        theta = two_pi * i / circle_density;
        x = radius * Math.cos(theta) + center[0];
        y = radius * Math.sin(theta) + center[1];
        data.push([x, y, depth / max_depth, color]);
    }
    shape_dict["circles"]["data"].push(data);
    cnt = shape_dict["circles"]["data"].length;
    gl.bindBuffer(gl.ARRAY_BUFFER, shape_dict["circles"]["VBO"]);
    gl.bufferData(gl.ARRAY_BUFFER, 6 * circle_density * FLOAT_SIZE * cnt, gl.DYNAMIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(shape_dict["circles"]["data"].flat(Infinity)));
}

function add_triangle(center){
    depth -= step;

    data = [
        [center[0]-0.1, center[1]-0.1, depth / max_depth, color],
        [center[0]+0.1, center[1]-0.1, depth / max_depth, color],
        [center[0], center[1]+0.1, depth / max_depth, color]
    ]
    shape_dict["triangles"]["data"].push(data);
    cnt = shape_dict["triangles"]["data"].length;
    gl.bindBuffer(gl.ARRAY_BUFFER, shape_dict["triangles"]["VBO"]);
    gl.bufferData(gl.ARRAY_BUFFER, 18 * FLOAT_SIZE * cnt, gl.DYNAMIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(shape_dict["triangles"]["data"].flat(Infinity)));
}

function add_square(center){
    depth -= step;
    data = [
        [center[0]+0.1, center[1]+0.1, depth / max_depth, color],
        [center[0]-0.1, center[1]+0.1, depth / max_depth, color],
        [center[0]-0.1, center[1]-0.1, depth / max_depth, color],
        [center[0]-0.1, center[1]-0.1, depth / max_depth, color],
        [center[0]+0.1, center[1]-0.1, depth / max_depth, color],
        [center[0]+0.1, center[1]+0.1, depth / max_depth, color]
    ]
    shape_dict["squares"]["data"].push(data);
    cnt = shape_dict["squares"]["data"].length;
    gl.bindBuffer(gl.ARRAY_BUFFER, shape_dict["squares"]["VBO"]);
    gl.bufferData(gl.ARRAY_BUFFER, 36 * FLOAT_SIZE * cnt, gl.DYNAMIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(shape_dict["squares"]["data"].flat(Infinity)));
}

function add_horizontal_line(center){
    depth -= step;
    data = [
        [center[0]-0.1, center[1], depth / max_depth, color],
        [center[0]+0.1, center[1], depth / max_depth, color]
    ]
    shape_dict["lines"]["data"].push(data);
    cnt = shape_dict["lines"]["data"].length;
    gl.bindBuffer(gl.ARRAY_BUFFER, shape_dict["lines"]["VBO"]);
    gl.bufferData(gl.ARRAY_BUFFER, 12 * FLOAT_SIZE * cnt, gl.DYNAMIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(shape_dict["lines"]["data"].flat(Infinity)));
}

function add_vertical_line(center){
    depth -= step;
    data = [
        [center[0], center[1]+0.1, depth / max_depth, color],
        [center[0], center[1]-0.1, depth / max_depth, color]
    ]
    shape_dict["lines"]["data"].push(data);
    cnt = shape_dict["lines"]["data"].length;
    gl.bindBuffer(gl.ARRAY_BUFFER, shape_dict["lines"]["VBO"]);
    gl.bufferData(gl.ARRAY_BUFFER, 12 * FLOAT_SIZE * cnt, gl.DYNAMIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(shape_dict["lines"]["data"].flat(Infinity)));
}

function draw_points(){
    gl.bindBuffer(gl.ARRAY_BUFFER, shape_dict["points"]["VBO"])
    gl.vertexAttribPointer(position_loc, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 0); // 步长，偏移
    gl.vertexAttribPointer(color_loc, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 3 * FLOAT_SIZE); // 步长，偏移
    gl.drawArrays(gl.POINTS, 0, shape_dict["points"]["data"].length);
}

function draw_circles(){
    gl.bindBuffer(gl.ARRAY_BUFFER, shape_dict["circles"]["VBO"])
    gl.vertexAttribPointer(position_loc, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 0); // 步长，偏移
    gl.vertexAttribPointer(color_loc, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 3 * FLOAT_SIZE); // 步长，偏移
    gl.drawArrays(gl.POINTS, 0, shape_dict["circles"]["data"].length * circle_density);
}

function draw_triangles(){
    gl.bindBuffer(gl.ARRAY_BUFFER, shape_dict["triangles"]["VBO"])
    gl.vertexAttribPointer(position_loc, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 0); // 步长，偏移
    gl.vertexAttribPointer(color_loc, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 3 * FLOAT_SIZE); // 步长，偏移
    gl.drawArrays(gl.TRIANGLES, 0, shape_dict["triangles"]["data"].length * 3);
}

function draw_squares(){
    gl.bindBuffer(gl.ARRAY_BUFFER, shape_dict["squares"]["VBO"])
    gl.vertexAttribPointer(position_loc, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 0); // 步长，偏移
    gl.vertexAttribPointer(color_loc, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 3 * FLOAT_SIZE); // 步长，偏移
    gl.drawArrays(gl.TRIANGLES, 0, shape_dict["squares"]["data"].length * 6);
}

function draw_lines(){
    gl.bindBuffer(gl.ARRAY_BUFFER, shape_dict["lines"]["VBO"])
    gl.vertexAttribPointer(position_loc, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 0); // 步长，偏移
    gl.vertexAttribPointer(color_loc, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 3 * FLOAT_SIZE); // 步长，偏移
    gl.drawArrays(gl.LINES, 0, shape_dict["lines"]["data"].length * 2);
}

function clear(){
    shapes.forEach(shape => {
        shape_dict[shape]["data"] = []
    });
}

gl.useProgram(program); 
gl.clearColor(0, 0, 0, 1);
gl.enable(gl.DEPTH_TEST);
function render (time) { 
    //Draw loop
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform1f(ratio_loc, get_aspect_ratio())
    draw_triangles();
    draw_circles();
    draw_points();
    draw_squares();
    draw_lines();
    requestAnimationFrame(render);
}
requestAnimationFrame(render);
        
document.addEventListener('keydown', function(event) {
    //p h v t q R
    if(shape_spec.includes(event.key)){
        next_shape = event.key
        if (event.key == 'p') shape_text.textContent ="Point"
        if (event.key == 'h') shape_text.textContent ="Horizontal Line"
        if (event.key == 'v') shape_text.textContent ="Vertial Line"
        if (event.key == 't') shape_text.textContent ="Triangle"
        if (event.key == 'q') shape_text.textContent ="Square"
        if (event.key == 'R') shape_text.textContent ="Circle"
    }

    if(color_spec.includes(event.key)){
        if(event.key == 'r'){ color = Color.RED; col_text.textContent ="Red"}
        if(event.key == 'g'){ color = Color.GREEN; col_text.textContent ="Green"}
        if(event.key == 'b'){ color = Color.BLUE; col_text.textContent ="Blue"}
    }

    if(event.key=="c"){
        clear();
    }

    if(event.key == "W"){
        canvas.width = canvas.width + 1;
        width_text.textContent = canvas.width;
    }

    if(event.key == "w"){
        canvas.width = canvas.width - 1;
        width_text.textContent = canvas.width;
    }

    if(event.key == "H"){
        canvas.height = canvas.height + 1;
        height_text.textContent = canvas.height;
    }

    if(event.key == "h"){
        canvas.height = canvas.height - 1;
        height_text.textContent = canvas.height;
    }
});

function get_aspect_ratio(){
    return canvas.width / canvas.height;
}

canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    half_width =  canvas.width / 2;
    half_height = canvas.height / 2;
    ratio = get_aspect_ratio();
    const x = (event.clientX - rect.left - half_width) / half_width * ratio
    const y = (canvas.height - event.clientY + rect.top - half_height) / half_height
    if(next_shape == 'p') add_point([x, y]);
    if(next_shape == 'h') add_horizontal_line([x, y]);
    if(next_shape == 'v') add_vertical_line([x, y]);
    if(next_shape == 't') add_triangle([x, y]);
    if(next_shape == 'q') add_square([x, y]);
    if(next_shape == 'R') add_circle([x, y]);
});