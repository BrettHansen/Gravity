var canvas;
var gl;

var shaderProgram;

var sphereMesh;
var objects = [];

var tick = 0;
var lastTime = 0;
var deltaTime = 0;

var G = .22;
var epsilon = .00001;

var eyePoint;
var atPoint;
var upVector;
var lookAtMatrix;
var projection;
var deltaR;

var pressedKeys = {};

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);

    gl.enable(gl.DEPTH_TEST);

    shaderProgram = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    //BRETT: uniforms to be passed to the shaders, now including the int stripe direction
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "MVMatrix");
    shaderProgram.projectionMatrixUniform = gl.getUniformLocation(shaderProgram, "PMatrix");
    shaderProgram.lookAtMatrixUniform = gl.getUniformLocation(shaderProgram, "LAMatrix");
    shaderProgram.normCompMatrixUniform = gl.getUniformLocation(shaderProgram, "NMVMatrix");
    shaderProgram.colorUniform = gl.getUniformLocation(shaderProgram, "ColorUniform");

    //BRETT: Global variable for controlling the scene parameters
    eyePoint = vec3(3, -4, 0);
    atPoint = vec3(0, 0, 0);
    upVector = vec3(0, 1, 0);
    lookAtMatrix = lookAt(eyePoint, atPoint, upVector);
    projection = perspective(50, 1.0, .5, 20);
    deltaR = 60;

    //BRETT: Creates the meshes for the shapes
    sphereMesh = createSphere(10);

    //BRETT: Initial setup for timing
    lastTime = Date.now();
    deltaTime = Date.now() - lastTime;

    //BRETT: Setup for key listeners
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    //BRETT: Start!
    createSceneObjects();
    render();
};

//BRETT: Create shapes out of meshes and setup the hierarchy
function createSceneObjects() {
    objects.push(new object(sphereMesh, yellow, vec3(0, 0, 0), .5, vec3(0, 0, 0), 100.0));

    var total = 200;
    var radius = 1;
    var speed = .5;
    for(var i = 0; i < total; i++) {
        // var angle = i / total * 2 * Math.PI;
        var angle = randomRange(0, 1) * 2 * Math.PI;
        objects.push(new object(sphereMesh, 
                                vec3(randomRange(0, 1), randomRange(0, 1), randomRange(0, 1)),
                                vec3(randomRange(-.1, .2), radius * Math.cos(angle) + randomRange(-.1, .2), radius * Math.sin(angle) + randomRange(-.1, .2)),
                                .02,
                                vec3(0, speed * -Math.sin(angle), speed * Math.cos(angle)),
                                .001));
    }
    // for(var i = 0; i < 300; i++) {
    //     var radius = Math.sqrt(randomRange(0, 2));
    //     var angle = randomRange(0, 1) * 2 * Math.PI;
    //     var speed = .2 * radius;
    //     objects.push(new object(sphereMesh,
    //                             blue,
    //                             vec3(0, radius * Math.cos(angle), radius * Math.sin(angle)),
    //                             .01,
    //                             vec3(0, speed * -Math.sin(angle), speed * Math.cos(angle)),
    //                             .02));
    // }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    //BRETT: Find elapsed time
    deltaTime = (Date.now() - lastTime) / 1000;
    lastTime += deltaTime * 1000;

    moveTime(deltaTime);
    collisionTest();

    moveCamera();
    lookAtMatrix = lookAt(eyePoint, atPoint, upVector);

    for(var i = 0; i < objects.length; i++) {
        objects[i].render(gl, projection, lookAtMatrix);
    }

    window.requestAnimFrame(render);

    tick += deltaTime;
}

function moveTime(deltaTime) {
    var t_squared = deltaTime * deltaTime;
    // Calculate and apply acceleration

    // var max_intensity = 0;
    for(var i = 0; i < objects.length; i++) {
        var acc = vec3(0, 0, 0);
        for(var j = 0; j < objects.length; j++) {
            acc = add(acc, gravitationalAcceleration(objects[i], objects[j]));
        }
        objects[i].velocity = add(objects[i].velocity, scale(.5 * t_squared, acc));
        // var intensity = magnitudeSquared(acc);
        // max_intensity = max(max_intensity, intensity);
        // objects[i].color = vec3(intensity, 0, 0);
    }
    // Move by velocity
    for(var i = 0; i < objects.length; i++) {
        // var intensity = objects[i].color[0] / max_intensity;
        // objects[i].color = vec3(intensity, 1 - intensity, 0);
        objects[i].position = add(objects[i].position, scale(deltaTime, objects[i].velocity));
        objects[i].recalculateModelView();
    }
}

function collisionTest() {
    for(var i = 0; i < objects.length - 1; i++) {
        for(var j = i + 1; j < objects.length; j++) {
            if(Math.sqrt(squaredDistance(objects[i].position, objects[j].position)) < objects[i].radius + objects[j].radius) {
                var new_mass = objects[i].mass + objects[j].mass;
                var p1 = objects[i].mass / new_mass;
                var p2 = objects[j].mass / new_mass;
                objects[i].mass = new_mass;
                objects[i].radius = Math.pow(Math.pow(objects[i].radius, 3) + Math.pow(objects[j].radius, 3), 1 / 3);
                objects[i].color = add(scale(p1, objects[i].color), scale(p2, objects[j].color));
                objects[i].velocity = add(scale(p1, objects[i].velocity), scale(p2, objects[j].velocity));
                objects[i].position = add(scale(p1, objects[i].position), scale(p2, objects[j].position));
                objects[i].recalculateModelView();
                objects.splice(j, 1);
                j--;
            }
        }
    }
}

function gravitationalAcceleration(object1, object2) {
    var dis = Math.sqrt(squaredDistance(object1.position, object2.position));
    if(dis < epsilon)
        return vec3(0, 0, 0);
    var dir = normalize(subtract(object2.position, object1.position));
    return scale(G * object2.mass / dis, dir);
}

function random() {
    return randomRange(-1, 2);
}

function randomRange(min, range) {
    return range * Math.random() + min;
}

function moveCamera() {
    //BRETT: Moves camera based on keys pressed down
    // UP
    if(pressedKeys[38]) {
        var dir = normalize(subtract(atPoint, eyePoint));
        dir = mult(rotate3D(0, 0, -40 * deltaTime), translate(dir));
        atPoint = add(getPositionFromTranslate(dir), eyePoint);
    }
    // DOWN
    if(pressedKeys[40]) {
        var dir = normalize(subtract(atPoint, eyePoint));
        dir = mult(rotate3D(0, 0, 40 * deltaTime), translate(dir));
        atPoint = add(getPositionFromTranslate(dir), eyePoint);
    }
    // LEFT
    if(pressedKeys[37]) {
        var dir = normalize(subtract(atPoint, eyePoint));
        dir = mult(rotate3D(0, 40 * deltaTime, 0), translate(dir));
        atPoint = add(getPositionFromTranslate(dir), eyePoint);
    }
    // RIGHT
    if(pressedKeys[39]) {
        var dir = normalize(subtract(atPoint, eyePoint));
        dir = mult(rotate3D(0, -40 * deltaTime, 0), translate(dir));
        atPoint = add(getPositionFromTranslate(dir), eyePoint);
    }
    // W
    if(pressedKeys[87]) {
        var dir = scale(-.1, normalize(subtract(eyePoint, atPoint)));
        eyePoint = add(eyePoint, dir);
        atPoint = add(atPoint, dir);
    }
    // S
    if(pressedKeys[83]) {
        var dir = scale(.1, normalize(subtract(eyePoint, atPoint)));
        eyePoint = add(eyePoint, dir);
        atPoint = add(atPoint, dir);
    }
    // if(pressedKeys[32]) {
    //     atPoint = add(atPoint, scale(5 * deltaTime, normalize(upVector)));
    //     eyePoint = add(eyePoint, scale(5 * deltaTime, normalize(upVector)));
    // }
    // if(pressedKeys[16]) {
    //     atPoint = add(atPoint, scale(-5 * deltaTime, normalize(upVector)));
    //     eyePoint = add(eyePoint, scale(-5 * deltaTime, normalize(upVector)));
    // }
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

function abs(n) {
    if(n < 0)
        return -n;
    return n;
}

function max(a, b) {
    if(a > b)
        return a;
    return b;
}

function toDegrees(rad) {
    return rad / Math.PI * 180;
}

function rotate3D(x, y, z) {
    return mult(mult(rotate(x, [1, 0, 0]), rotate(y, [0, 1, 0])), rotate(z, [0, 0, 1]));
}

function getPositionFromTranslate(u) {
    return vec3(u[0][3], u[1][3], u[2][3]);
}

function squaredDistance(p1, p2) {
    var dist = 0;
    for(var i = 0; i < p1.length && i < p2.length; i++)
        dist += (p1[i] - p2[i]) * (p1[i] - p2[i]);
    return dist;
}

function handleKeyDown(event) {
    pressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
    pressedKeys[event.keyCode] = false;
}