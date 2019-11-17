class Project {
  constructor() {
    this.gl = document.getElementById('canvas').getContext('webgl');

    this.program = createShaderProgram(this.gl, vertex, fragment);
    this.program2 = createShaderProgram(this.gl, sVertex, sFragment);

    this.fShape = new FShape(this.gl, this.program);
    this.cameraShape = new CameraRepr(this.gl, this.program2);



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


    resizeCanvasToDisplaySize(this.gl.canvas);
    this.gl.canvas.style.transform = `translateY(${ window.scrollY }px`; // removes parallax effect

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.SCISSOR_TEST);

    // Compute the camera's matrix using look at.
    let worldMatrix = m4.yRotation(degToRad(this.settings.rotation));
    worldMatrix = m4.xRotate(worldMatrix, degToRad(this.settings.rotation));
    worldMatrix = m4.translate(worldMatrix, -35, -75, -5);


    let leftAspect = this.setSceneAndGetAspectRatio(this.leftElement);
    let leftCameraMatrix = this.getCameraMatrix(this.getCameraPosition());
    let leftProjectionMatrix = this.getPerspectiveProjectionMatrix(leftAspect, leftCameraMatrix);
    this.drawScene(worldMatrix, leftCameraMatrix, leftProjectionMatrix);



    let rightAspect = this.setSceneAndGetAspectRatio(this.rightElement);
    let rightCameraMatrix = this.getCameraMatrix([-600, 400, -400]);
    let rightProjectionMatrix = this.getPerspectiveProjectionMatrix(rightAspect, rightCameraMatrix);
    this.drawScene(worldMatrix, rightCameraMatrix, rightProjectionMatrix);




    {

      // Make a view matrix from the 2nd camera matrix.
      let viewMatrix = m4.inverse(rightCameraMatrix);
      let matrix = m4.multiply(rightProjectionMatrix, viewMatrix);
      // use the first's camera's matrix as the matrix to position
      // the camera's representative in the scene
      matrix = m4.multiply(matrix, leftCameraMatrix);



      this.gl.useProgram(this.program2);

      this.cameraShape.initBuffers(matrix);

      // this.gl.uniformMatrix4fv(this.matrixLocation2, false, matrix);
      // this.gl.uniform4fv(this.cameraShape.colorUniformLocations, [0, 0, 0, 1]);

      let primitiveType = this.gl.LINES;
      let count = 48;
      let offset = 0;
      this.gl.drawElements(primitiveType, count, this.gl.UNSIGNED_SHORT, offset);
    }

    // requestAnimationFrame(this.render);
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
    this.gl.clearColor(1, 1, 1, 1);

    return width / height
  }

  getCameraMatrix(position) {
    const up = [0, 1, 0];
    const target = [0, 0, 0];
    return m4.lookAt(position, target, up);
  }

  getPerspectiveProjectionMatrix(aspect) {
    const angle = degToRad(this.settings.fov);
    return m4.perspective(angle, aspect, this.settings.near, this.settings.far);
  }

  //---------------------------------*\
  //             DRAWING
  //---------------------------------*/

  drawScene(worldMatrix, cameraMatrix, projectionMatrix) {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    const viewMatrix = m4.inverse(cameraMatrix);
    let matrix = m4.multiply(projectionMatrix, viewMatrix);
    matrix = m4.multiply(matrix, worldMatrix);

    this.gl.useProgram(this.program);

    this.fShape.initBuffers()
    this.gl.uniformMatrix4fv(this.fShape.matrixLocation, false, matrix);



    let primitiveType = this.gl.TRIANGLES;
    let offset = 0;
    let count = 16 * 6;
    this.gl.drawArrays(primitiveType, offset, count);
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
    return [this.settings.cam1PosX, this.settings.cam1PosY, this.settings.cam1PosZ];
  }
}
