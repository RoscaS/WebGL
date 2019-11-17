let vertexBuffer = null;
let indexBuffer = null;
let colorBuffer = null;

let indices = [];

let mvMatrix = mat4.create();
let pMatrix = mat4.create();

function initShaderParameters(prg) {
  prg.vertexPositionAttribute = glContext.getAttribLocation(prg, 'aVertexPosition');
  glContext.enableVertexAttribArray(prg.vertexPositionAttribute);

  prg.colorAttribute = glContext.getAttribLocation(prg, 'aColor');
  glContext.enableVertexAttribArray(prg.colorAttribute);

  prg.pMatrixUniform = glContext.getUniformLocation(prg, 'uPMatrix');
  prg.mvMatrixUniform = glContext.getUniformLocation(prg, 'uMVMatrix');
}

function initBuffers() {

  indices.push(0, 1, 2);
  indexBuffer = getIndexBufferWithIndices(indices);
}

let i = 0.01;

function drawScene() {
  let colors = [];
  let vertices = [];
  i += 0.01;

  vertices.push(-1.0 + Math.sin(i), -1.0 + Math.sin(i),
    -5.1 + Math.sin(i) * 2,
  );
  vertices.push(1.0 + Math.cos(i), -1.0 + Math.sin(i),
    -5.1 + Math.sin(i) * 2,
  );
  vertices.push(0.0 + Math.cos(i), 1.0 + Math.cos(i),
    -5.1 + Math.sin(i) * 2,
  );

  vertexBuffer = getVertexBufferWithVertices(vertices);

  //
  colors.push(Math.abs(Math.sin(i)), Math.abs(Math.tan(i * 0.1)), Math.abs(Math.cos(i)), 1.0,);
  colors.push(Math.abs(Math.sin(i)), Math.abs(Math.cos(i)), Math.abs(Math.sin(i)), 1.0,);
  colors.push(Math.abs(Math.cos(Math.sin(i))), Math.abs(Math.sin(i)), Math.abs(Math.sin(i * 0.5)), 1.0,);

  colorBuffer = getVertexBufferWithVertices(colors);

  glContext.clearColor(1.0, 1.0, 1.0, 1.0);
  glContext.enable(glContext.DEPTH_TEST);
  glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);
  glContext.viewport(0, 0, c_width, c_height);

  mat4.identity(mvMatrix);
  mat4.identity(pMatrix);
  mat4.perspective(pMatrix, degToRad(60), c_width / c_height, 0.1, 40);

  glContext.uniformMatrix4fv(prg.pMatrixUniform, false, pMatrix);
  glContext.uniformMatrix4fv(prg.mvMatrixUniform, false, mvMatrix);
  glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer);
  glContext.vertexAttribPointer(prg.vertexPositionAttribute, 3, glContext.FLOAT, false, 0, 0,);
  glContext.bindBuffer(glContext.ARRAY_BUFFER, colorBuffer);
  glContext.vertexAttribPointer(prg.colorAttribute, 4, glContext.FLOAT, false, 0, 0,);
  glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, indexBuffer);
  glContext.drawElements(glContext.TRIANGLE_STRIP, indices.length, glContext.UNSIGNED_SHORT, 0,);
}

function initWebGL() {
  glContext = getGLContext('webgl-canvas');
  initProgram();
  initBuffers();
  renderLoop();
}
