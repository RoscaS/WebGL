
class Project {
  constructor() {
    const canvas = document.getElementById('canvas');
    this.gl = canvas.getContext('webgl');

    this.width = canvas.width;
    this.height = canvas.height;
    this.dt = 0;

    this.program = createShaderProgram(this.gl, vertex, fragment);

    this.initAttributes();
    this.initBuffers();
    this.initControlValues();
    this.initHtmlElements();

    this.render();
  }

   /*------------------------------------------------------------------*\
   |*							            INITIALIZATION
   \*------------------------------------------------------------------*/

  initAttributes() {
    this.positionLocation = this.gl.getAttribLocation(this.program,
      'a_position',
    );
    this.colorLocation = this.gl.getAttribLocation(this.program, 'a_color');
    this.matrixLocation = this.gl.getUniformLocation(this.program, 'u_matrix');
  }

  initBuffers() {
    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    setGeometry(this.gl);

    this.colorBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    setColors(this.gl);
  }

  initHtmlElements() {
    const contentEl = document.querySelector('#content');
    let leftOuterEl = createHtmlElement('div', contentEl, 'item');
    let rightOuterEl = createHtmlElement('div', contentEl, 'item');

    this.leftElement = createHtmlElement('div', leftOuterEl, 'view');
    this.rightElement = createHtmlElement('div', rightOuterEl, 'view');
  }

   /*------------------------------------------------------------------*\
   |*							               RENDERING
   \*------------------------------------------------------------------*/

  render = () => {
    this.dt += 1;

    resizeCanvasToDisplaySize(this.gl.canvas);

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.SCISSOR_TEST);
    this.gl.useProgram(this.program);

    this.gl.canvas.style.transform = `translateY(${window.scrollY}px`;

    const up = [0, 1, 0];
    const target = [0, 0, 0];
    const cameraPosition = [0, 0, -75];

    this.cameraMatrix = m4.lookAt(cameraPosition, target, up);
    this.worldMatrix = m4.yRotation(degToRad(this.values.rotation));
    this.worldMatrix = m4.xRotate(this.worldMatrix, degToRad(this.values.rotation));
    this.worldMatrix = m4.translate(this.worldMatrix, -90, -120, 50);

    this.leftScene();
    this.rightScene();

    requestAnimationFrame(this.render)
  };

  leftScene() {
    const rect = this.leftElement.getBoundingClientRect();
    const width = rect.right - rect.left;
    const height = rect.bottom - rect.top;
    const left = rect.left;
    const bottom = this.gl.canvas.clientHeight - rect.bottom -1;

    this.gl.viewport(left, bottom, width, height);
    this.gl.scissor(left, bottom, width, height);
    this.gl.clearColor(1, 1, 1, 1);


    const aspect = width / height;
    const units = 120;
    const orthographicProjectionMatrix = m4.orthographic(
      -units * aspect,  // left
       units * aspect,  // right
      -units,           // bottom
       units,           // top
       this.values.near,
       this.values.far
    );

    this.drawScene(orthographicProjectionMatrix, this.cameraMatrix, this.worldMatrix);
  }e;

  rightScene() {
    const rect = this.rightElement.getBoundingClientRect();
    const width = rect.right - rect.left;
    const height = rect.bottom - rect.top;
    const left = rect.left;
    const bottom = this.gl.canvas.clientHeight - rect.bottom -1;

    this.gl.viewport(left, bottom, width, height);
    this.gl.scissor(left, bottom, width, height);
    this.gl.clearColor(1, 1, 1, 1);

    const aspect = width / height;

    const perspectiveProjectionMatrix =
      m4.perspective(this.values.fov, aspect, this.values.near, this.values.far);

    this.drawScene(perspectiveProjectionMatrix, this.cameraMatrix, this.worldMatrix);
  }


  drawScene(projectionMatrix, cameraMatrix, worldMatrix) {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.bindBuffers();

    const viewMatrix = m4.inverse(cameraMatrix);
    let matrix = m4.multiply(projectionMatrix, viewMatrix);
    matrix = m4.multiply(matrix, worldMatrix);
    this.gl.uniformMatrix4fv(this.matrixLocation, false, matrix);

    let primitiveType = this.gl.TRIANGLES;
    let count = 16 * 6;
    let offset = 0;
    this.gl.drawArrays(primitiveType, offset, count);
  }


  bindBuffers() {
    this.gl.enableVertexAttribArray(this.positionLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

    let size = 3;
    let type = this.gl.FLOAT;
    let normalize = false;
    let stride = 0;
    let offset = 0;

    this.gl.vertexAttribPointer(
      this.positionLocation,
      size, type, normalize, stride, offset,
    );

    this.gl.enableVertexAttribArray(this.colorLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);

    size = 3;
    type = this.gl.UNSIGNED_BYTE;
    normalize = true; // convert from 0-255 to 0-1
    stride = 0;
    offset = 0;

    this.gl.vertexAttribPointer(
      this.colorLocation,
      size, type, normalize, stride, offset,
    );
  }

   /*------------------------------------------------------------------*\
   |*							                VALUES
   \*------------------------------------------------------------------*/

  initControlValues() {
    this.values = {
      rotation: 150,
      fov: degToRad(60),
      near: 1,
      far: 2000
    };
  }
}
