// Pointers on buffers
let vertexBuffer = null;
let colorBuffer = null;
let indexBuffer = null;

// Corresponding JS arrays
let colors = [];
let indices = [];
let vertices = [];

let dt = 0.01;
let sin = () => Math.sin(dt);
let cos = () => Math.cos(dt);

let a = () => [-1 + sin() * 2, -1.0 * sin() * 2, -5.1 + sin() * 2];
let b = () => [1 + cos(), -1.0 * sin() * 2, -5.1 + sin() * 2];
let c = () => [cos(), cos(),  -5.1 + sin() * 2];

let ca = () => [Math.abs(sin()), Math.abs(Math.tan(dt * 0.1)), Math.abs(cos()), 1.0,];
let cb = () => [Math.abs(sin()), Math.abs(cos()), Math.abs(sin()), 1.0,];
let cc = () => [Math.abs(Math.cos(sin())), Math.abs(sin()), Math.abs(sin()), 1.0,];


// Transform matrix
let mvMatrix = mat4.create(); // Model-view matrix
let pMatrix = mat4.create();  // Projection matrix

// Bridges between CPU (JS) and GPU (Shaders)
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

// Scene initialization.
// The data defined here is used inside the Shaders programs.
function initBuffers() {
  indices.push(0, 1, 2);
  indexBuffer = getIndexBufferWithIndices(indices);
}

// Rerender stage (Five main steps of rendering)
function drawScene() {
  dt += 0.01;
  colors = [];
  vertices = [];
  vertices.push(...a());
  vertices.push(...b());
  vertices.push(...c());

  colors.push(...ca());
  colors.push(...cb());
  colors.push(...cc());

  vertexBuffer = getVertexBufferWithVertices(vertices);
  colorBuffer = getVertexBufferWithVertices(colors);


  // Background color
  glContext.clearColor(1, 1, 1, 1.0);
  glContext.enable(glContext.DEPTH_TEST);
  glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);
  glContext.viewport(0, 0, c_width, c_height);

  // Transformation matrices
  mat4.identity(pMatrix);
  mat4.identity(mvMatrix);
  mat4.perspective(pMatrix, degToRad(60), c_width / c_height, 0.1, 40);

  glContext.uniformMatrix4fv(prg.pMatrixUniform, false, pMatrix);
  glContext.uniformMatrix4fv(prg.mvMatrixUniform, false, mvMatrix);
  glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer);
  glContext.vertexAttribPointer(prg.vertexPositionAttribute, 3, glContext.FLOAT,
    false, 0, 0,
  );
  glContext.bindBuffer(glContext.ARRAY_BUFFER, colorBuffer);
  glContext.vertexAttribPointer(prg.colorAttribute, 4, glContext.FLOAT, false,
    0, 0,
  );
  glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, indexBuffer);
  glContext.drawElements(glContext.TRIANGLE_STRIP, indices.length,
    glContext.UNSIGNED_SHORT, 0,
  );
}

// Entrypoint
function initWebGL() {
  glContext = getGLContext('webgl-canvas');
  initProgram();
  initBuffers();
  renderLoop();
}
