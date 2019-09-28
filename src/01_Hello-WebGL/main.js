// Pointers on buffers
let vertexBuffer = null;
let colorBuffer = null;
let indexBuffer = null;

// Corresponding JS arrays
let vertices = [];
let colors = [];
let indices = [];

// Transform matrix
let mvMatrix = mat4.create(); // Model-view matrix
let pMatrix = mat4.create();  // Projection matrix

// Bridges between CPU (JS) and GPU (Shaders)
function initShaderParameters(prg) {
  // Geometry, related to "attribute" type qualifier inside shaders program
  prg.vertexPositionAttribute = glContext.getAttribLocation(prg, "aVertexPosition");
  glContext.enableVertexAttribArray(prg.vertexPositionAttribute);

  // Colors, related to "attribute" type qualifier inside shaders program
  prg.colorAttribute = glContext.getAttribLocation(prg, "aColor");
  glContext.enableVertexAttribArray(prg.colorAttribute);

  // Transform matrix, related to "uniform" type qualifier inside shader program
  prg.pMatrixUniform = glContext.getUniformLocation(prg, 'uPMatrix');

  // Transform matrix, related to "uniform" type qualifier inside shader program
  prg.mvMatrixUniform = glContext.getUniformLocation(prg, 'uMVMatrix');
}

// Scene initialization.
// The data defined here is used inside the Shaders programs.
function initBuffers() {
  vertices.push(-1.0, -1.0, 0.0); // Bottom left vertex
  vertices.push( 1.0, -1.0, 0.0); // Bottom right vertex
  vertices.push( 0.0,  1.0, 0.0); // Top vertex

  colors.push(1.0, 0.0, 0.0, 1.0); // Bottom left corner
  colors.push(0.0, 1.0, 0.0, 1.0); // Bottom right corner
  colors.push(0.0, 0.0, 1.0, 1.0); // Top corner

  // Specifies to the GPU the geometric construction order
  indices.push(0, 1, 2);

  // Assign buffers.
  // both functions turns CPU type data to GPU type
  vertexBuffer = getVertexBufferWithVertices(vertices);
  colorBuffer = getVertexBufferWithVertices(colors);
  indexBuffer = getIndexBufferWithIndices(indices);
}

// Rerender stage (Five main steps of rendering)
function drawScene() {
  // a) Stage settings
  {
    // Background color
    glContext.clearColor(0.9, 0.9, 0.9, 1.0);
    // Render polygones in their depth order (Z-buffer)
    // An alternative would be the declaration order
    glContext.enable(glContext.DEPTH_TEST);
    // Reset color and depth buffer
    glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);
    // Map the final projection to canvas size
    glContext.viewport(0, 0, c_width, c_height);
  }

  // b) Build perspective (set transform matrices). Related to camera
  {
    // Transformation matrices
    mat4.identity(pMatrix);
    mat4.identity(mvMatrix);

    // Morph basic projection matrix to perspective matrix
    // mat4.perspective(60, c_width / c_height, 0.1, 10000.0, pMatrix)

    glContext.uniformMatrix4fv(prg.pMatrixUniform, false, pMatrix);
    glContext.uniformMatrix4fv(prg.mvMatrixUniform, false, mvMatrix);
  }


  // c) Define vertices
  {
    // Vertices
    glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer);
    glContext.vertexAttribPointer(prg.vertexPositionAttribute, 3, glContext.FLOAT, false, 0, 0);

    // Related colours
    glContext.bindBuffer(glContext.ARRAY_BUFFER, colorBuffer);
    glContext.vertexAttribPointer(prg.colorAttribute, 4, glContext.FLOAT, false, 0, 0);
  }

  // d) Links between vertice
  glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // e) Type of shape declaration
  glContext.drawElements(glContext.TRIANGLES, indices.length, glContext.UNSIGNED_SHORT, 0);
}

// Entrypoint
function initWebGL() {
  glContext = getGLContext('webgl-canvas');
  initProgram();
  initBuffers();
  renderLoop();
}
