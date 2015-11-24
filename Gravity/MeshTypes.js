//BRETT: Mesh creation and storage
function mesh(vertices, textCoords, normals, itemSize, numItems) {
    var vPosBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vPosBuff);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    vPosBuff.itemSize = itemSize;
    vPosBuff.numItems = numItems;

    var vTexBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vTexBuff);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(textCoords), gl.STATIC_DRAW);

    var vNorBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vNorBuff);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    this.vertexPositionBuffer = vPosBuff;
    this.vertexNormalBuffer = vNorBuff;
    this.vertexTextureBuffer = vTexBuff;
}

//BRETT: Create 2d-square
function createSquare() {
    var vertices = [
        vec3(-1, 0, -1),
        vec3(-1, 0,  1),
        vec3( 1, 0, -1),
        vec3(-1, 0,  1),
        vec3( 1, 0, -1),
        vec3( 1, 0,  1)];

    var textCoords = [
        vec2(0, 0),
        vec2(0, 1),
        vec2(1, 0),
        vec2(0, 1),
        vec2(1, 0),
        vec2(1, 1)];

    var normals = [
        vec3(0, 1, 0),
        vec3(0, 1, 0),
        vec3(0, 1, 0),
        vec3(0, 1, 0),
        vec3(0, 1, 0),
        vec3(0, 1, 0)];

    return new mesh(vertices, textCoords, normals, 3, 6);
}

//BRETT: Create 2d-circle
function createCircle(sample) {
    var vertices = [];
    var textCoords = [];
    var normals = [];

    for(var i = 0; i < sample; i++) {
        var prop1 = i / sample;
        var propm = (i + .5) / sample;
        var prop2 = (i + 1) / sample;
        var theta1 = prop1 * 2 * Math.PI;
        var thetam = propm * 2 * Math.PI;
        var theta2 = prop2 * 2 * Math.PI;
        var cartX1 = Math.cos(theta1);
        var cartY1 = Math.sin(theta1);
        var cartX2 = Math.cos(theta2);
        var cartY2 = Math.sin(theta2);

        vertices.push(vec3(cartX1, 0, cartY1));
        textCoords.push(vec2(prop1, 0));
        normals.push(vec3(0, 1, 0));
        vertices.push(vec3(0, 0, 0));
        textCoords.push(vec2(propm, 1));
        normals.push(vec3(0, 1, 0));
        vertices.push(vec3(cartX2, 0, cartY2));
        textCoords.push(vec2(prop2, 0));
        normals.push(vec3(0, 1, 0));
    }

    return new mesh(vertices, textCoords, normals, 3, 3 * sample);
}

//BRETT: Create hollow cylinder
function createCylinder(sample) {
    var vertices = [];
    var textCoords = [];
    var normals = [];

    for(var i = 0; i < sample; i++) {
        var prop1 = i / sample;
        var prop2 = (i + 1) / sample;
        var theta1 = prop1 * 2 * Math.PI;
        var theta2 = prop2 * 2 * Math.PI;
        var cartX1 = Math.cos(theta1);
        var cartY1 = Math.sin(theta1);
        var cartX2 = Math.cos(theta2);
        var cartY2 = Math.sin(theta2);
        
        // Triangle with two vertices on top rim of cylinder
        vertices.push(vec3(cartX1, 1, cartY1));
        textCoords.push(vec2(prop1, 1));
        normals.push(normalize(vec3(cartX1, 0, cartY1)));
        vertices.push(vec3(cartX1, 0, cartY1));
        textCoords.push(vec2(prop1, 0));
        normals.push(normalize(vec3(cartX1, 0, cartY1)));
        vertices.push(vec3(cartX2, 1, cartY2));
        textCoords.push(vec2(prop2, 1));
        normals.push(normalize(vec3(cartX2, 0, cartY2)));

        // Triangle with two vertices on bottom rim of cylinder
        vertices.push(vec3(cartX1, 0, cartY1));
        textCoords.push(vec2(prop1, 0));
        normals.push(normalize(vec3(cartX1, 0, cartY1)));
        vertices.push(vec3(cartX2, 1, cartY2));
        textCoords.push(vec2(prop2, 1));
        normals.push(normalize(vec3(cartX2, 0, cartY2)));
        vertices.push(vec3(cartX2, 0, cartY2));
        textCoords.push(vec2(prop2, 0));
        normals.push(normalize(vec3(cartX2, 0, cartY2)));
    }

    return new mesh(vertices, textCoords, normals, 3, 6 * sample);
}

//BRETT: Create hollow cone
function createCone(sample) {
    var vertices = [];
    var textCoords = [];
    var normals = [];

    for(var i = 0; i < sample; i++) {
        var prop1 = i / sample;
        var propm = (i + .5) / sample;
        var prop2 = (i + 1) / sample;
        var theta1 = prop1 * 2 * Math.PI;
        var thetam = propm * 2 * Math.PI;
        var theta2 = prop2 * 2 * Math.PI;
        var cartX1 = Math.cos(theta1);
        var cartY1 = Math.sin(theta1);
        var cartXm = Math.cos(thetam);
        var cartYm = Math.sin(thetam);
        var cartX2 = Math.cos(theta2);
        var cartY2 = Math.sin(theta2);

        vertices.push(vec3(cartX1, 0, cartY1));
        textCoords.push(vec2(prop1, 0));
        normals.push(normalize(vec3(cartX1, .5, cartY1)));
        vertices.push(vec3(0, 1, 0));
        textCoords.push(vec2(propm, 1));
        normals.push(normalize(vec3(cartXm, .5, cartYm)));
        vertices.push(vec3(cartX2, 0, cartY2));
        textCoords.push(vec2(prop2, 0));
        normals.push(normalize(vec3(cartX2, .5, cartY2)));
    }

    return new mesh(vertices, textCoords, normals, 3, 3 * sample);
}

//BRETT: Create Sphere
function createSphere(sample) {
    var equator = [];
    var vertices = [];
    var vertexPositions = [];
    var textCoords = [];
    var normals = [];

    for(var i = 0; i <= sample; i++) {
        var prop = i / sample * 2 * Math.PI;
        equator.push(vec2(Math.cos(prop), Math.sin(prop)));
    }
    for(var i = 0; i <= sample; i++) {
        var prop = i / sample;
        var gamma = prop * Math.PI + .5 * Math.PI;
        var alpha = Math.cos(gamma);
        var z = Math.sin(gamma);
        vertices[i] = [];
        for(var j = 0; j < equator.length; j++)
            vertices[i].push(vec3(alpha * equator[j][0], z, alpha * equator[j][1]));
    }
    for(var i = 0; i < vertices.length - 1; i++) {
        for(var j = 0; j < vertices[i].length - 1; j++) {
            vertexPositions.push(vertices[i][j]);
            textCoords.push(vec2(i / vertices.length, j / vertices[i].length));
            normals.push(normalize(vertices[i][j].slice()));
            vertexPositions.push(vertices[i][j + 1]);
            textCoords.push(vec2(i / vertices.length, (j + 1) / vertices[i].length));
            normals.push(normalize(vertices[i][j + 1].slice()));
            vertexPositions.push(vertices[i + 1][j]);
            textCoords.push(vec2((i + 1) / vertices.length, j / vertices[i].length));
            normals.push(normalize(vertices[i + 1][j].slice()));

            vertexPositions.push(vertices[i][j + 1]);
            textCoords.push(vec2(i / vertices.length, (j + 1) / vertices[i].length));
            normals.push(normalize(vertices[i][j + 1].slice()));
            vertexPositions.push(vertices[i + 1][j]);
            textCoords.push(vec2((i + 1) / vertices.length, j / vertices[i].length));
            normals.push(normalize(vertices[i + 1][j].slice()));
            vertexPositions.push(vertices[i + 1][j + 1]);
            textCoords.push(vec2((i + 1) / vertices.length, (j + 1) / vertices[i].length));
            normals.push(normalize(vertices[i + 1][j + 1].slice()));
        }
    }  

    return new mesh(vertexPositions, textCoords, normals, 3, 6 * sample * sample);
}

//BRETT: Create cylinder with top and bottom
function createCappedCylinder(sample) {
    var vertices = [];
    var textCoords = [];
    var normals = [];

    for(var i = 0; i < sample; i++) {
        var prop1 = i / sample;
        var propm = (i + .5) / sample;
        var prop2 = (i + 1) / sample;
        var theta1 = prop1 * 2 * Math.PI;
        var theta2 = prop2 * 2 * Math.PI;
        var cartX1 = Math.cos(theta1);
        var cartY1 = Math.sin(theta1);
        var cartX2 = Math.cos(theta2);
        var cartY2 = Math.sin(theta2);
        
        // Triangle with two vertices on top rim of cylinder
        vertices.push(vec3(cartX1, 1, cartY1));
        textCoords.push(vec2(prop1, 1));
        normals.push(normalize(vec3(cartX1, 0, cartY1)));
        vertices.push(vec3(cartX1, 0, cartY1));
        textCoords.push(vec2(prop1, 0));
        normals.push(normalize(vec3(cartX1, 0, cartY1)));
        vertices.push(vec3(cartX2, 1, cartY2));
        textCoords.push(vec2(prop2, 1));
        normals.push(normalize(vec3(cartX2, 0, cartY2)));

        // Triangle with two vertices on bottom rim of cylinder
        vertices.push(vec3(cartX1, 0, cartY1));
        textCoords.push(vec2(prop1, 0));
        normals.push(normalize(vec3(cartX1, 0, cartY1)));
        vertices.push(vec3(cartX2, 1, cartY2));
        textCoords.push(vec2(prop2, 1));
        normals.push(normalize(vec3(cartX2, 0, cartY2)));
        vertices.push(vec3(cartX2, 0, cartY2));
        textCoords.push(vec2(prop2, 0));
        normals.push(normalize(vec3(cartX2, 0, cartY2)));

        // Top cap
        vertices.push(vec3(cartX1, 1, cartY1));
        textCoords.push(vec2(prop1, 1));
        normals.push(vec3(0, 1, 0));
        vertices.push(vec3(0, 1, 0));
        textCoords.push(vec2(propm, 1));
        normals.push(vec3(0, 1, 0));
        vertices.push(vec3(cartX2, 1, cartY2));
        textCoords.push(vec2(prop2, 1));
        normals.push(vec3(0, 1, 0));

        // Bottom cap
        vertices.push(vec3(cartX1, 0, cartY1));
        textCoords.push(vec2(prop1, 0));
        normals.push(vec3(0, -1, 0));
        vertices.push(vec3(0, 0, 0));
        textCoords.push(vec2(propm, 0));
        normals.push(vec3(0, -1, 0));
        vertices.push(vec3(cartX2, 0, cartY2));
        textCoords.push(vec2(prop2, 0));
        normals.push(vec3(0, -1, 0));

    }

    return new mesh(vertices, textCoords, normals, 3, 12 * sample);
}

function createParticleMesh(sample, particleSize) {
    var vertices = [];
    var textCoords = [];
    var normals = [];
    for(var i = 0; i < sample; i++) {
        var x1 = Math.random();
        var y1 = Math.random();
        var z1 = Math.random();
        var p1 = vec3(x1, y1, z1);

        var x2 = x1 + (Math.random() - .5) * particleSize;
        var y2 = y1 + (Math.random() - .5) * particleSize;
        var z2 = z1 + (Math.random() - .5) * particleSize;
        var p2 = vec3(x2, y2, z2);

        var x3 = x1 + (Math.random() - .5) * particleSize;
        var y3 = y1 + (Math.random() - .5) * particleSize;
        var z3 = z1 + (Math.random() - .5) * particleSize;
        var p3 = vec3(x3, y3, z3);

        var v12 = subtract(p2, p1);
        var v23 = subtract(p3, p1);
        var normal = cross(v12, v23);

        vertices.push(p1);
        vertices.push(p2);
        vertices.push(p3);
        textCoords.push(vec2(0, 0));
        textCoords.push(vec2(0, 1));
        textCoords.push(vec2(1, 0));
        normals.push(normal);
        normals.push(normal);
        normals.push(normal);
    }

    return new mesh(vertices, textCoords, normals, 3, 3 * sample);
}

