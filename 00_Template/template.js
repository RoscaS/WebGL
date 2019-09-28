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

// Bridges between CPU and GPU
function initShaderParameters(prg) {

}

// Scene initialization
function initBuffers() {

}

// Rerender scene
function drawScene() {

}

// Entrypoint
function initWebGL() {
  let glContext = getGLContext('webgl-canvas');

  initProgram();

  initBuffers();

  renderLoop();

}
