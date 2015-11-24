var canvas;
var gl;

var shaderProgram;

var sphereMesh;
var objects = [];

var tick = 0;
var lastTime = 0;
var deltaTime = 0;

var G = 1;
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
    gl.clearColor(0.6, 0.7, 1.0, 1.0);

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
    eyePoint = vec3(6, 0, 0);
    atPoint = vec3(0, 0, 0);
    upVector = vec3(0, 1, 0);
    lookAtMatrix = lookAt(eyePoint, atPoint, upVector);
    projection = perspective(50, 1.0, .5, 20);
    deltaR = 60;

    //BRETT: Creates the meshes for the shapes
    sphereMesh = createSphere(20);

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
    objects.push(new object(sphereMesh, yellow, vec3(0, 0, 0), vec3(.5, .5, .5), vec3(0, 0, 0), 100.0));

    for(var i = 0; i < 20; i++) {
        objects.push(new object(sphereMesh, 
                                vec3(random(), random(), random()),
                                vec3(random(), random(), random()),
                                vec3(.1, .1, .1),
                                vec3(random(), random(), random()),
                                1.0));
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    //BRETT: Find elapsed time
    deltaTime = (Date.now() - lastTime) / 1000;
    lastTime += deltaTime * 1000;

    moveTime(deltaTime);

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
    for(var i = 0; i < objects.length; i++) {
        var acc = vec3(0, 0, 0);
        for(var j = 0; j < objects.length; j++) {
            acc = add(acc, gravitationalAcceleration(objects[i], objects[j]));
        }
        objects[i].velocity = add(objects[i].velocity, scale(.5 * t_squared, acc));
    }
    // Move by velocity
    for(var i = 0; i < objects.length; i++) {
        objects[i].position = add(objects[i].position, scale(deltaTime, objects[i].velocity));
        objects[i].recalculateModelView();
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
    return 2 * (Math.random() - .5);
}

function moveCamera() {
    //BRETT: Moves camera based on keys pressed down
    if(pressedKeys[38]) {
        var dir = scale(-.1, normalize(subtract(eyePoint, atPoint)));
        eyePoint = add(eyePoint, dir);
        atPoint = add(atPoint, dir);
    }
    if(pressedKeys[40]) {
        var dir = scale(.1, normalize(subtract(eyePoint, atPoint)));
        eyePoint = add(eyePoint, dir);
        atPoint = add(atPoint, dir);
    }
    if(pressedKeys[37]) {
        var dir = normalize(subtract(atPoint, eyePoint));
        dir = mult(rotate3D(0, 40 * deltaTime, 0), translate(dir));
        atPoint = add(getPositionFromTranslate(dir), eyePoint);
    }
    if(pressedKeys[39]) {
        var dir = normalize(subtract(atPoint, eyePoint));
        dir = mult(rotate3D(0, -40 * deltaTime, 0), translate(dir));
        atPoint = add(getPositionFromTranslate(dir), eyePoint);
    }
    if(pressedKeys[32]) {
        atPoint = add(atPoint, scale(5 * deltaTime, normalize(upVector)));
        eyePoint = add(eyePoint, scale(5 * deltaTime, normalize(upVector)));
    }
    if(pressedKeys[16]) {
        atPoint = add(atPoint, scale(-5 * deltaTime, normalize(upVector)));
        eyePoint = add(eyePoint, scale(-5 * deltaTime, normalize(upVector)));
    }
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

function abs(n) {
    if(n < 0)
        return -n;
    return n;
}

function toDegrees(rad) {
    return rad / Math.PI * 180;
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