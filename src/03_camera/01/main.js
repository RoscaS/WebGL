class Project {
  constructor() {
    const canvas = document.getElementById('canvas');
    this.gl = canvas.getContext('webgl');

    this.width = canvas.width;
    this.height = canvas.height;
    this.dt = 0;

    this.program = createShaderProgram(this.gl, vertex, fragment);
    this.colorProgram = createShaderProgram(this.gl, sVertex, sFragment);

    this.initAttributes();
    this.initBuffers();
    this.initControlValues();
    this.initHtmlElements();

    this.initUI();
    this.render();
  }

  //------------------------------------------------------------------*\
  //							            INITIALIZATION
  //------------------------------------------------------------------*/

  //---------------------------------*\
  //             ATTRIBUTES
  //---------------------------------*/

  initAttributes() {
    this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    this.colorLocation = this.gl.getAttribLocation(this.program, 'a_color');
    this.matrixLocation = this.gl.getUniformLocation(this.program, 'u_matrix');
  }

  //---------------------------------*\
  //             BUFFERS
  //---------------------------------*/

  initBuffers() {
    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

    this.indicesBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);

    setGeometry(this.gl);
    // createCameraBuffer(this.gl, this.cameraScale);

    this.colorBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    setColors(this.gl);
  }

  //---------------------------------*\
  //             HTML
  //---------------------------------*/

  initHtmlElements() {
    const scenesEl = document.querySelector('#scenes');
    let leftOuterEl = createHtmlElement('div', scenesEl, 'item');
    let rightOuterEl = createHtmlElement('div', scenesEl, 'item');

    this.leftElement = createHtmlElement('div', leftOuterEl, 'view');
    this.rightElement = createHtmlElement('div', rightOuterEl, 'view');
  }

  //---------------------------------*\
  //             SCENE
  //---------------------------------*/

  setScene(htmlElement, drawCallback) {
    const rect = htmlElement.getBoundingClientRect();
    const width = rect.right - rect.left;
    const height = rect.bottom - rect.top;
    const left = rect.left;
    const bottom = this.gl.canvas.clientHeight - rect.bottom - 1;

    this.gl.viewport(left, bottom, width, height);
    this.gl.scissor(left, bottom, width, height);
    this.gl.clearColor(1, 1, 1, 1);

    const aspect = width / height;
    drawCallback(aspect);
  }

  //------------------------------------------------------------------*\
  //							               RENDERING
  //------------------------------------------------------------------*/

  render = () => {
    this.dt += 1;
    resizeCanvasToDisplaySize(this.gl.canvas);
    this.gl.canvas.style.transform = `translateY(${ window.scrollY }px`; // removes parallax effect

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.SCISSOR_TEST);

    this.gl.useProgram(this.program);



    const target = [0, 0, 0];
    const up = [0, 1, 0];
    this.cameraMatrix = m4.lookAt(this.getCameraPosition(), target, up);
    this.worldMatrix = m4.yRotation(degToRad(this.settings.rotation));
    this.worldMatrix = m4.xRotate(this.worldMatrix, degToRad(this.settings.rotation));

    // center the 'F' around its origin
    this.worldMatrix = m4.translate(this.worldMatrix,  -35, -75, -5);

    this.setScene(this.leftElement, this.leftProjection);
    this.setScene(this.rightElement, this.rightProjection);




    requestAnimationFrame(this.render);
  };

  //---------------------------------*\
  //               LEFT
  //---------------------------------*/

  leftProjection = aspect => {
    const units = 120;
    const orthographicProjectionMatrix = m4.orthographic(
        -units * aspect,  // left
        units * aspect,  // right
        -units,           // bottom
        units,           // top
        this.settings.near,
        this.settings.far,
    );
    this.drawScene(orthographicProjectionMatrix, this.cameraMatrix, this.worldMatrix);
  };

  //---------------------------------*\
  //               RIGHT
  //---------------------------------*/

  rightProjection = aspect => {
    const perspectiveProjectionMatrix =
        m4.perspective(degToRad(this.settings.fov), aspect, this.settings.near, this.settings.far);
    this.drawScene(perspectiveProjectionMatrix, this.cameraMatrix, this.worldMatrix);
  };

  //---------------------------------*\
  //             DRAWING
  //---------------------------------*/

  drawScene(projectionMatrix, cameraMatrix, worldMatrix) {
    this.bindBuffers();
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    const viewMatrix = m4.inverse(cameraMatrix);
    let matrix = m4.multiply(projectionMatrix, viewMatrix);
    matrix = m4.multiply(matrix, worldMatrix);
    this.gl.uniformMatrix4fv(this.matrixLocation, false, matrix);

    let primitiveType = this.gl.TRIANGLES;
    let count = 16 * 6;
    let offset = 0;
    this.gl.drawArrays(primitiveType, offset, count);
  }

  //---------------------------------*\
  //             BINDING
  //---------------------------------*/

  bindBuffers() {
    this.gl.enableVertexAttribArray(this.positionLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    let size = 3;
    let type = this.gl.FLOAT;
    let normalize = false;
    let stride = 0;
    let offset = 0;
    this.gl.vertexAttribPointer(this.positionLocation, size, type, normalize, stride, offset);

    this.gl.enableVertexAttribArray(this.colorLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    size = 3;
    type = this.gl.UNSIGNED_BYTE;
    normalize = true; // convert from 0-255 to 0-1
    stride = 0;
    offset = 0;
    this.gl.vertexAttribPointer(this.colorLocation, size, type, normalize, stride, offset);
  }

  //------------------------------------------------------------------*\
  //							                SETTINGS
  //------------------------------------------------------------------*/

  initControlValues() {
    this.settings = {
      rotation: 150,
      fov: 60,




      cam1PosX: 0,
      cam1PosY: 0,
      cam1PosZ: -200,


      cameraScale: 20,
      near: 1,
      far: 2000,
    };
  }

  //------------------------------------------------------------------*\
  //							                UI
  //------------------------------------------------------------------*/

  initUI() {
    webglLessonsUI.setupUI(document.querySelector('#ui'), this.settings, [
      {
        type: 'slider',
        key: 'rotation',
        min: 0,
        max: 360,
        change: this.render,
        precision: 2,
        step: 0.001,
      },
      {
        type: 'slider',
        key: 'fov',
        min: 1,
        max: 170,
        change: this.render,
      },
      { type: 'slider', key: 'cam1PosX', min: -200, max: 200, change: this.render },
      { type: 'slider', key: 'cam1PosY', min: -200, max: 200, change: this.render },
      { type: 'slider', key: 'cam1PosZ', min: -200, max: 200, change: this.render },
    ]);
  }

  getCameraPosition() {
    return [this.settings.cam1PosX, this.settings.cam1PosY, this.settings.cam1PosZ]
  }
}
