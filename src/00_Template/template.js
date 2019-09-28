// Pointers on buffers
let vertexBuffer = null;
let indexBuffer = null;
let colorBuffer = null;

// Corresponding JS arrays
let indices = [];
let vertices = [];
let colors = [];

// Transform matrix
let mvMatrix = mat4.create(); // Model-view matrix
let pMatrix = mat4.create();  // Projection matrix

// Bridges between CPU (JS) and GPU (Shaders)
function initShaderParameters(prg) {

}

// Scene initialization
function initBuffers() {
  // ...
  vertexBuffer = getVertexBufferWithVertices(vertices);
  colorBuffer = getVertexBufferWithVertices(colors);
  indexBuffer = getIndexBufferWithIndices(indices);

}

// Rerender scene
function drawScene() {
  glContext.clearColor(0.9, 0.9, 0.9, 1.0);
  glContext.clearColor(1, 1, 1, 1.0);
  glContext.enable(glContext.DEPTH_TEST);
  glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);
  glContext.viewport(0, 0, c_width, c_height);

  mat4.identity(pMatrix);
  mat4.identity(mvMatrix);
  glContext.uniformMatrix4fv(prg.pMatrixUniform, false, pMatrix);
  glContext.uniformMatrix4fv(prg.mvMatrixUniform, false, mvMatrix);

  glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer);
  glContext.vertexAttribPointer(prg.vertexPositionAttribute, 3, glContext.FLOAT, false, 0, 0);

  glContext.bindBuffer(glContext.ARRAY_BUFFER, colorBuffer);
  glContext.vertexAttribPointer(prg.colorAttribute, 4, glContext.FLOAT, false, 0, 0);

  glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, indexBuffer);

  glContext.drawElements(glContext.TRIANGLES, indices.length, glContext.UNSIGNED_SHORT, 0);
}

// Entrypoint
function initWebGL() {
  let glContext = getGLContext('webgl-canvas');
  initProgram();
  initBuffers();
  renderLoop();
}
