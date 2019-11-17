class CameraRepr {
  constructor(gl, program) {
    this.gl = gl;
    this.program = program;
    this.scale = 20;

    this.positions = null;
    this.indices = null;
    this.initGeometryData();

    this.vertexCount = this.positions.length / 3;


    this.initBuffers()



  }


  initBuffers(matrix) {

    this.matrixLocation = this.gl.getUniformLocation(this.program, 'u_matrix');
    this.colorUniformLocations = this.gl.getUniformLocation(this.program, 'u_color');

    this.iBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices, this.gl.STATIC_DRAW);


    this.pBuffer = this.gl.createBuffer();
    this.positionAttributeLocations = this.gl.getAttribLocation(this.program, 'a_position');
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pBuffer);

    this.gl.enableVertexAttribArray(this.positionAttributeLocations);
    this.gl.vertexAttribPointer(this.positionAttributeLocations, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.positions, this.gl.STATIC_DRAW);

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);


    if (matrix) {
      this.gl.uniformMatrix4fv(this.matrixLocation, false, matrix);
      this.gl.uniform4fv(this.colorUniformLocations, [0, 0, 0, 1]);
    }
  }


  initGeometryData() {
    let positions = [
      -1, -1, 1,
      1, -1, 1,
      -1, 1, 1,
      1, 1, 1,
      -1, -1, 3,
      1, -1, 3,
      -1, 1, 3,
      1, 1, 3,

      0, 0, 1, // Pointe du cone
    ];

    let indices = [
      0, 1, 1, 3, 3, 2, 2, 0,
      4, 5, 5, 7, 7, 6, 6, 4,
      0, 4, 1, 5, 3, 7, 2, 6,
    ];

    const numSegments = 6;
    const coneBaseIndex = positions.length / 3;
    const coneTipIndex = coneBaseIndex - 1;
    for (let i = 0; i < numSegments; ++i) {
      const u = i / numSegments;
      const angle = u * Math.PI * 2;
      const x = Math.cos(angle);
      const y = Math.sin(angle);
      positions.push(x, y, 0);
      // line from tip to edge
      indices.push(coneTipIndex, coneBaseIndex + i);
      // line from point on edge to next point on edge
      indices.push(coneBaseIndex + i, coneBaseIndex + (i + 1) % numSegments);
    }

    positions.forEach((v, ndx) => {
      positions[ndx] *= this.scale;
    });



    positions = new Float32Array(positions);
    indices = new Uint16Array(indices);

    this.positions = positions;
    this.indices = indices;

  }
}

class FShape {
  constructor(gl, program) {
    this.gl = gl;
    this.program = program;

    this.initBuffers();

  }

  initBuffers() {
    this.matrixLocation = this.gl.getUniformLocation(this.program, 'u_matrix');


    this.initAttributesAndBuffers('a_position', this.gl.FLOAT, false);
    this.setGeometryData();

    this.initAttributesAndBuffers('a_color', this.gl.UNSIGNED_BYTE, true);
    this.setColorData();
  }

  initAttributesAndBuffers(attrName, attrType, normalize) {
    const location = this.gl.getAttribLocation(this.program, attrName);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer());

    this.gl.enableVertexAttribArray(location);
    const size = 3;
    const type = attrType;
    const stride = 0;
    const offset = 0;
    this.gl.vertexAttribPointer(location, size, type, normalize, stride, offset);
  }

  setGeometryData() {
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([
        // left bar front
        0, 0, 0,
        0, 150, 0,
        30, 0, 0,
        0, 150, 0,
        30, 150, 0,
        30, 0, 0,

        // top bar front
        30, 0, 0,
        30, 30, 0,
        100, 0, 0,
        30, 30, 0,
        100, 30, 0,
        100, 0, 0,

        // center bar front
        30, 60, 0,
        30, 90, 0,
        67, 60, 0,
        30, 90, 0,
        67, 90, 0,
        67, 60, 0,

        // left bar back
        0, 0, 30,
        30, 0, 30,
        0, 150, 30,
        0, 150, 30,
        30, 0, 30,
        30, 150, 30,

        // top bar back
        30, 0, 30,
        100, 0, 30,
        30, 30, 30,
        30, 30, 30,
        100, 0, 30,
        100, 30, 30,

        // center bar back
        30, 60, 30,
        67, 60, 30,
        30, 90, 30,
        30, 90, 30,
        67, 60, 30,
        67, 90, 30,

        // top
        0, 0, 0,
        100, 0, 0,
        100, 0, 30,
        0, 0, 0,
        100, 0, 30,
        0, 0, 30,

        // top bar right
        100, 0, 0,
        100, 30, 0,
        100, 30, 30,
        100, 0, 0,
        100, 30, 30,
        100, 0, 30,

        // under top bar
        30, 30, 0,
        30, 30, 30,
        100, 30, 30,
        30, 30, 0,
        100, 30, 30,
        100, 30, 0,

        // between top bar and center
        30, 30, 0,
        30, 60, 30,
        30, 30, 30,
        30, 30, 0,
        30, 60, 0,
        30, 60, 30,

        // top of center bar
        30, 60, 0,
        67, 60, 30,
        30, 60, 30,
        30, 60, 0,
        67, 60, 0,
        67, 60, 30,

        // right of center bar
        67, 60, 0,
        67, 90, 30,
        67, 60, 30,
        67, 60, 0,
        67, 90, 0,
        67, 90, 30,

        // bottom of center bar.
        30, 90, 0,
        30, 90, 30,
        67, 90, 30,
        30, 90, 0,
        67, 90, 30,
        67, 90, 0,

        // right of bottom
        30, 90, 0,
        30, 150, 30,
        30, 90, 30,
        30, 90, 0,
        30, 150, 0,
        30, 150, 30,

        // bottom
        0, 150, 0,
        0, 150, 30,
        30, 150, 30,
        0, 150, 0,
        30, 150, 30,
        30, 150, 0,

        // left side
        0, 0, 0,
        0, 0, 30,
        0, 150, 30,
        0, 0, 0,
        0, 150, 30,
        0, 150, 0,
      ]),
      this.gl.STATIC_DRAW,
    );
  }

  setColorData() {
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Uint8Array([
        // left front
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,

        // top bar front
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,

        // center bar front
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,

        // left bar back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

        // top bar back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

        // center bar back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

        // top
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,

        // top bar right
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,

        // under top bar
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,

        // between top bar and center
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,

        // top of center bar
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,

        // right of center bar
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,

        // bottom of center bar.
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,

        // right of bottom
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,

        // bottom
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,

        // left side
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
      ]),
      this.gl.STATIC_DRAW,
    );
  }
}
