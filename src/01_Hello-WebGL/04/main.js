let vertexBuffer = null;
let colorBuffer = null;
let indexBuffer = null;

let vertices = [];
let colors = [];
let indices = [];

let mvMatrix = mat4.create(); // Model-view matrix
let pMatrix = mat4.create();  // Projection matrix

function initShaderParameters(prg) {
  prg.vertexPositionAttribute = glContext.getAttribLocation(prg,
    'aVertexPosition',
  );
  glContext.enableVertexAttribArray(prg.vertexPositionAttribute);

  prg.colorAttribute = glContext.getAttribLocation(prg, 'aColor');
  glContext.enableVertexAttribArray(prg.colorAttribute);

  prg.pMatrixUniform = glContext.getUniformLocation(prg, 'uPMatrix');

  prg.mvMatrixUniform = glContext.getUniformLocation(prg, 'uMVMatrix');
}

function initBuffers() {
  vertices.push(-1.0, -1.0, -2.0); // Bottom left vertex
  vertices.push(1.0, -1.0, -2.0); // Bottom right vertex
  vertices.push(0.0, 1.0, -2.0); // Top vertex

  colors.push(1.0, 0.0, 0.0, 1.0); // Bottom left corner
  colors.push(0.0, 1.0, 0.0, 1.0); // Bottom right corner
  colors.push(0.0, 0.0, 1.0, 1.0); // Top corner

  indices.push(0, 1, 2);

  vertexBuffer = getVertexBufferWithVertices(vertices);
  colorBuffer = getVertexBufferWithVertices(colors);
  indexBuffer = getIndexBufferWithIndices(indices);
}

function drawScene() {
  glContext.clearColor(0.9, 0.9, 0.9, 1.0);
  glContext.clearColor(1, 1, 1, 1.0);
  glContext.enable(glContext.DEPTH_TEST);
  glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);
  glContext.viewport(0, 0, c_width, c_height);

  mat4.identity(pMatrix);
  mat4.identity(mvMatrix);
  mat4.perspective(pMatrix, degToRad(60), c_width / c_height, 0.1, 40);

  // mat4.perspective(60, c_width / c_height, 0.1, 10000.0, pMatrix)

  glContext.uniformMatrix4fv(prg.pMatrixUniform, false, pMatrix);
  glContext.uniformMatrix4fv(prg.mvMatrixUniform, false, mvMatrix);

  glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer);
  glContext.vertexAttribPointer(prg.vertexPositionAttribute, 3, glContext.FLOAT, false, 0, 0,);

  glContext.bindBuffer(glContext.ARRAY_BUFFER, colorBuffer);
  glContext.vertexAttribPointer(prg.colorAttribute, 4, glContext.FLOAT, false, 0, 0,);
  glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, indexBuffer);

  glContext.drawElements(glContext.TRIANGLE_STRIP, indices.length, glContext.UNSIGNED_SHORT, 0,);
}
  // Entrypoint
  function initWebGL() {
    glContext = getGLContext('webgl-canvas');
    initProgram();
    initBuffers();
    renderLoop();
  }
