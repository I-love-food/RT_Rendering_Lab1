function create_shader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        shader_name = "vertex"
        if(type == gl.FRAGMENT_SHADER)
            shader_name = "fragment"
        alert(shader_name + " shader create success!")
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function create_program(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        alert("create program success!")
        return program;
    }
    
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

vertex_shader_code = `
    attribute vec3 a_position;
    attribute vec3 a_color;

    varying vec3 color;
    uniform float ratio;

    void main() {
        vec3 pp = a_position;
        pp[0] /= ratio;
        gl_Position = vec4(pp, 1.0);
        gl_PointSize = 3.0;
        color = a_color;
    }`

fragment_shader_code = `
    precision mediump float;
    varying vec3 color;
    void main() {
        gl_FragColor = vec4(color, 1);
    }`


