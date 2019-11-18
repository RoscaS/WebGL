class Project {
  constructor() {
    this.gl = document.getElementById('canvas').getContext('webgl');
    window.addEventListener('resize', this.render);

    this.program = createShaderProgram(this.gl, vertex, fragment);
    this.programCamera = createShaderProgram(this.gl, sVertex, sFragment);

    this.fShape = new FShape(this.gl, this.program);
    this.cameraShape = new CameraRepr(this.gl, this.programCamera);
    this.frustrumShape = new FrustrumShape(this.gl, this.programCamera);

    this.initControlValues();
    this.initHtmlElements();
    this.initUI();

    this.render();
  }

  //------------------------------------------------------------------*\
  //							            INITIALIZATION
  //------------------------------------------------------------------*/

  initHtmlElements() {
    const scenesEl = document.querySelector('#scenes');
    let leftOuterEl = createHtmlElement('div', scenesEl, 'item');
    let rightOuterEl = createHtmlElement('div', scenesEl, 'item');

    this.leftElement = createHtmlElement('div', leftOuterEl, 'view');
    this.rightElement = createHtmlElement('div', rightOuterEl, 'view');
  }

  //------------------------------------------------------------------*\
  //							               RENDERING
  //------------------------------------------------------------------*/

  render = () => {

    resizeCanvasToDisplaySize(this.gl.canvas, this.render);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.SCISSOR_TEST);

    this.gl.canvas.style.transform = `translateY(${ window.scrollY }px`; // removes parallax effect

    this.gl.useProgram(this.program);
    this.fShape.initBuffers();

    // Compute the camera's matrix using look at.
    let worldMatrix = m4.yRotation(degToRad(this.settings.rotation));
    worldMatrix = m4.xRotate(worldMatrix, degToRad(this.settings.rotation));
    worldMatrix = m4.translate(worldMatrix, -35, -75, -5);

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    let leftAspect = this.setSceneAndGetAspectRatio(this.leftElement);
    let leftCameraMatrix = this.getCameraMatrix(this.getCameraPosition());

    let leftAngle = degToRad(this.settings.fov);
    let leftProjectionMatrix = null;

    if (this.settings.orthographic) {
      leftProjectionMatrix = m4.orthographic(
        -this.settings.ortho_size * leftAspect,
        this.settings.ortho_size * leftAspect,
        -this.settings.ortho_size,
        this.settings.ortho_size,
        this.settings.cam_near,
        this.settings.cam_far,
      );
    } else {
      leftProjectionMatrix = m4.perspective(leftAngle, leftAspect, this.settings.cam_near,
        this.settings.cam_far,
      );
    }
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.drawScene(worldMatrix, leftCameraMatrix, leftProjectionMatrix);
    let rightAspect = this.setSceneAndGetAspectRatio(this.rightElement);
    // let rightCameraMatrix = this.getCameraMatrix([-600, 400, -400]);
    let rightCameraMatrix = this.getCameraMatrix([-700, 400, -400]);
    let rightAngle = degToRad(60);
    let rightProjectionMatrix = m4.perspective(rightAngle, rightAspect, this.settings.near,
      this.settings.far,
    );
    this.drawScene(worldMatrix, rightCameraMatrix, rightProjectionMatrix);

    this.drawCamera(rightCameraMatrix, rightProjectionMatrix, leftCameraMatrix,
      leftProjectionMatrix,
    );

  };

  //------------------------------------------------------------------*\
  //							               SCENE
  //------------------------------------------------------------------*/

  setSceneAndGetAspectRatio(htmlElement) {
    const rect = htmlElement.getBoundingClientRect();
    const width = rect.right - rect.left;
    const height = rect.bottom - rect.top;
    const left = rect.left;
    const bottom = this.gl.canvas.clientHeight - rect.bottom - 1;

    this.gl.viewport(left, bottom, width, height);
    this.gl.scissor(left, bottom, width, height);
    // this.gl.clearColor(1, 1, 1, 1);
    // this.gl.clearColor(0, 0, 0, 1);
    this.settings.dark ? this.gl.clearColor(0, 0, 0, 1) : this.gl.clearColor(1, 1, 1, 1);

    return width / height;
  }

  getCameraMatrix(position) {
    const up = [0, 1, 0];
    const target = [0, 0, 0];
    return m4.lookAt(position, target, up);
  }

  //---------------------------------*\
  //             DRAWING
  //---------------------------------*/

  drawScene(worldMatrix, cameraMatrix, projectionMatrix) {
    const viewMatrix = m4.inverse(cameraMatrix);
    let matrix = m4.multiply(projectionMatrix, viewMatrix);
    matrix = m4.multiply(matrix, worldMatrix);

    this.gl.uniformMatrix4fv(this.fShape.matrixUniformLocation, false, matrix);

    let primitiveType = this.gl.TRIANGLES;
    let offset = 0;
    let count = this.fShape.size / 3;
    this.gl.drawArrays(primitiveType, offset, count);
  }

  drawCamera(
    sceneB_CameraMatrix, sceneB_ProjectionMatrix, sceneA_CameraMatrix, sceneA_ProjectionMatrix) {

    let color = this.settings.dark ? [1, 1, 1, 1] : [0, 0, 0, 1];
    // Make a view matrix from the 2nd camera matrix.
    let viewMatrix = m4.inverse(sceneB_CameraMatrix);
    let matrix = m4.multiply(sceneB_ProjectionMatrix, viewMatrix);

    // use the first's camera's matrix as the matrix to position
    // the camera's representative in the scene
    matrix = m4.multiply(matrix, sceneA_CameraMatrix);

    this.gl.useProgram(this.programCamera);

    this.cameraShape.initBuffers(matrix);
    this.gl.uniformMatrix4fv(this.cameraShape.matrixUniformLocation, false, matrix);
    this.gl.uniform4fv(this.cameraShape.colorUniformLocations, color);

    let primitiveType = this.gl.LINES;
    let count = this.cameraShape.indices.length;
    let offset = 0;
    this.gl.drawElements(primitiveType, count, this.gl.UNSIGNED_SHORT, offset);

    // Frustrum
    matrix = m4.multiply(matrix, m4.inverse(sceneA_ProjectionMatrix));
    this.frustrumShape.initBuffers(matrix);
    this.gl.uniformMatrix4fv(this.frustrumShape.matrixUniformLocation, false, matrix);
    this.gl.uniform4fv(this.frustrumShape.colorUniformLocations, color);

    count = this.frustrumShape.indices.length;
    this.gl.drawElements(primitiveType, count, this.gl.UNSIGNED_SHORT, offset);
  }

  //------------------------------------------------------------------*\
  //							                SETTINGS
  //------------------------------------------------------------------*/

  initControlValues() {
    this.settings = {
      rotation: 170,
      fov: 60,
      dark: true,
      quality: false,

      cam_X: -100,
      cam_Y: 0,
      cam_Z: -300,

      cam_near: 90,
      cam_far: 550,

      orthographic: false,
      ortho_size: 120,

      near: 1,
      far: 2000,

      cameraScale: 20,
    };
  }

  //------------------------------------------------------------------*\
  //							                UI
  //------------------------------------------------------------------*/

  initUI() {
    webglLessonsUI.setupUI(document.querySelector('#uiLeft'), this.settings, [
      { type: 'slider', key: 'cam_X', min: -350, max: 350, change: this.render },
      { type: 'slider', key: 'cam_Y', min: -350, max: 350, change: this.render },
      { type: 'slider', key: 'cam_Z', min: -350, max: 350, change: this.render },
    ]);
    webglLessonsUI.setupUI(document.querySelector('#uiCenter'), this.settings, [
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
      { type: 'slider', key: 'ortho_size', min: 1, max: 150, change: this.render },
    ]);

    webglLessonsUI.setupUI(document.querySelector('#uiRight'), this.settings, [
      { type: 'slider', key: 'cam_near', min: 1, max: 500, change: this.render },
      { type: 'slider', key: 'cam_far', min: 1, max: 800, change: this.render },
      { type: 'checkbox', key: 'orthographic', change: this.render },
      { type: 'checkbox', key: 'dark', change: this.render },
    ]);
  }

  getCameraPosition() {
    return [this.settings.cam_X, this.settings.cam_Y, this.settings.cam_Z];
  }
}
