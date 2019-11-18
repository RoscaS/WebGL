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

    this.leftHtmlElement = createHtmlElement('div', leftOuterEl, 'view');
    this.rightHtmlElement = createHtmlElement('div', rightOuterEl, 'view');
  }

  //------------------------------------------------------------------*\
  //							               RENDERING
  //------------------------------------------------------------------*/

  leftFovRad = () => degToRad(this.settings.left_fov);
  rightFovRad = () => degToRad(this.settings.right_fov);

  render = () => {

    resizeCanvasToDisplaySize(this.gl.canvas, this.render);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.SCISSOR_TEST);
    this.gl.canvas.style.transform = `translateY(${ window.scrollY }px`; // removes parallax effect
    this.gl.useProgram(this.program);

    let worldMatrix = this.createWorldMatrix();

    // SCENES
    this.fShape.initBuffers();
    let leftAspect = this.getSplittedAspectRatio(this.leftHtmlElement);
    let leftCamera = this.getCameraMatrix(this.getCameraPosition());
    let leftProjection = this.settings.orthographic
                         ? this.createOrthographicProjection(leftAspect)
                         : this.createPerspectiveProjection(this.leftFovRad(), leftAspect, true);
    this.drawScene(worldMatrix, leftCamera, leftProjection);

    let rightAspect = this.getSplittedAspectRatio(this.rightHtmlElement);
    let rightCamera = this.getCameraMatrix(this.getFixedCameraPosition());
    let rightProjection = this.createPerspectiveProjection(this.rightFovRad(), rightAspect, false);
    this.drawScene(worldMatrix, rightCamera, rightProjection);

    // CAMERA AND FROSTRUM
    this.injectCamera(rightCamera, rightProjection, leftCamera, leftProjection);
  };

  //------------------------------------------------------------------*\
  //							               SCENE
  //------------------------------------------------------------------*/

  getSplittedAspectRatio(htmlElement) {
    const rect = htmlElement.getBoundingClientRect();
    const width = rect.right - rect.left;
    const height = rect.bottom - rect.top;
    const left = rect.left;
    const bottom = this.gl.canvas.clientHeight - rect.bottom - 1;

    this.gl.viewport(left, bottom, width, height);
    this.gl.scissor(left, bottom, width, height);
    this.settings.dark ? this.gl.clearColor(0, 0, 0, 1) : this.gl.clearColor(1, 1, 1, 1);

    return width / height;
  }

  getCameraMatrix(position) {
    const up = [0, 1, 0];
    const target = [0, 0, 0];
    return m4.lookAt(position, target, up);
  }

  //------------------------------------------------------------------*\
  //							               MATRICES
  //------------------------------------------------------------------*/

  createWorldMatrix() {
    let worldMatrix = m4.yRotation(degToRad(this.settings.rotation));
    worldMatrix = m4.xRotate(worldMatrix, degToRad(this.settings.rotation));
    return m4.translate(worldMatrix, -35, -75, -5);
  }

  createOrthographicProjection(aspectRatio) {
    return m4.orthographic(
      -this.settings.ortho_size * aspectRatio,
      this.settings.ortho_size * aspectRatio,
      -this.settings.ortho_size,
      this.settings.ortho_size,
      this.settings.cam_near,
      this.settings.cam_far,
    );
  }

  createPerspectiveProjection(angle, aspectRatio, isPOV) {
    let near = isPOV ? this.settings.cam_near : this.settings.near;
    let far = isPOV ? this.settings.cam_far : this.settings.far;
    return m4.perspective(angle, aspectRatio, near, far);
  }

  //---------------------------------*\
  //             DRAWING
  //---------------------------------*/

  drawScene(worldMatrix, cameraMatrix, projectionMatrix) {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    const viewMatrix = m4.inverse(cameraMatrix);
    let matrix = m4.multiply(projectionMatrix, viewMatrix);
    matrix = m4.multiply(matrix, worldMatrix);

    this.gl.uniformMatrix4fv(this.fShape.matrixUniformLocation, false, matrix);

    let primitiveType = this.gl.TRIANGLES;
    let offset = 0;
    let count = this.fShape.size / 3;
    this.gl.drawArrays(primitiveType, offset, count);
  }

  injectCamera(
    sceneB_CameraMatrix, sceneB_ProjectionMatrix, sceneA_CameraMatrix, sceneA_ProjectionMatrix) {

    this.gl.useProgram(this.programCamera);
    const black = [1, 1, 1, 1];
    const white = [0, 0, 0, 1];

    let color = this.settings.dark ? black : white;
    // Make a view matrix from the 2nd camera matrix.
    let viewMatrix = m4.inverse(sceneB_CameraMatrix);
    let matrix = m4.multiply(sceneB_ProjectionMatrix, viewMatrix);

    // use the first's camera's matrix as the matrix to position
    // the camera's representative in the scene
    matrix = m4.multiply(matrix, sceneA_CameraMatrix);

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
      left_fov: 60,
      right_fov: 60,
      dark: true,
      quality: false,

      cam_X: -100,
      cam_Y: 0,
      cam_Z: -300,

      fixed_X: -700,
      fixed_Y: 400,
      fixed_Z: -400,

      cam_near: 60,
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
        key: 'left_fov',
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

  getFixedCameraPosition() {
    return [this.settings.fixed_X, this.settings.fixed_Y, this.settings.fixed_Z];
  }
}
