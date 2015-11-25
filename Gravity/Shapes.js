function object(mesh, color, position, scale, velocity, mass) {
    this.mesh = mesh;
    this.color = color;
    this.position = position;
    this.translate = translate(position);
    this.radius = scale;
    this.scale = scalem(scale, scale, scale);
    this.modelView = createModelView(this.translate, this.scale);
    this.mass = mass;
    this.velocity = velocity;

    this.recalculateModelView = function() {
        this.translate = translate(this.position);
        this.scale = scalem(this.radius, this.radius, this.radius);
        this.modelView = createModelView(this.translate, this.scale);
    };
    this.render = function(gl, projection, lookAtMatrix) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.vertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.mesh.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, flatten(this.modelView));
        gl.uniformMatrix4fv(shaderProgram.projectionMatrixUniform, false, flatten(projection));
        gl.uniformMatrix4fv(shaderProgram.lookAtMatrixUniform, false, flatten(lookAtMatrix));
        gl.uniform3fv(shaderProgram.colorUniform, flatten(this.color));
        gl.drawArrays(gl.TRIANGLES, 0, this.mesh.vertexPositionBuffer.numItems);
    }
}

function createModelView(translate, scale) {
    return mult(translate, scale);
}