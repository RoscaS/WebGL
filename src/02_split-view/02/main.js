'use strict';

const contentElem = document.querySelector('#content');
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

// setup GLSL programs
// compiles shaders, links program, looks up locations
const shaders = ['shader-vs', 'shader-fs'];
const programInfo = webglUtils.createProgramInfo(gl, shaders);

// create buffers and fill with data for various things.
const cube = primitives.createCubeBufferInfo(gl,1,1,1);

const items = [];
const itemCount = 2;

for (let i = 0; i < itemCount; ++i) {
  const outerElem = createElem('div', contentElem, 'item');
  const viewElem = createElem('div', outerElem, 'view');
  // const labelElem = createElem('div', outerElem, 'label');
  // labelElem.textContent = `Item ${ i + 1 }`;
  const bufferInfo = cube;
  const color = [1, 1, 1, 1];
  items.push({ bufferInfo, color, element: viewElem });
}

function degToRad(d) {
  return d * Math.PI / 180;
}

const fieldOfViewRadians = degToRad(60);





function drawScene(projectionMatrix, cameraMatrix, worldMatrix, bufferInfo) {
  // Clear the canvas AND the depth buffer.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Make a view matrix from the camera matrix.
  const viewMatrix = m4.inverse(cameraMatrix);

  let mat = m4.multiply(projectionMatrix, viewMatrix);
  mat = m4.multiply(mat, worldMatrix);

  gl.useProgram(programInfo.program);

  // ------ Draw the bufferInfo --------

  // Setup all the needed attributes.
  webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);

  // Set the uniform
  webglUtils.setUniforms(programInfo, {
    u_matrix: mat,
  });

  webglUtils.drawBufferInfo(gl, bufferInfo);
}

function render(time) {
  time *= 0.001;  // convert to seconds

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.SCISSOR_TEST);

  // move the canvas to top of the current scroll position
  gl.canvas.style.transform = `translateY(${ window.scrollY }px)`;

  for (const { bufferInfo, element, color } of items) {
    const rect = element.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > gl.canvas.clientHeight ||
      rect.right < 0 || rect.left > gl.canvas.clientWidth) {
      continue;  // it's off screen
    }

    const width = rect.right - rect.left;
    const height = rect.bottom - rect.top;
    const left = rect.left;
    const bottom = gl.canvas.clientHeight - rect.bottom - 1;

    gl.viewport(left, bottom, width, height);
    gl.scissor(left, bottom, width, height);
    gl.clearColor(...color);

    const aspect = width / height;
    const near = 1;
    const far = 2000;

    // Compute a perspective projection matrix
    const perspectiveProjectionMatrix =
      m4.perspective(fieldOfViewRadians, aspect, near, far);

    // Compute the camera's matrix using look at.
    const cameraPosition = [0, 0, -2];
    const target = [0, 0, 0];
    const up = [0, 1, 0];
    const cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // rotate the item
    const rTime = time * 0.2;
    const worldMatrix = m4.xRotate(m4.yRotation(rTime), rTime);

    drawScene(perspectiveProjectionMatrix, cameraMatrix, worldMatrix,
      bufferInfo,
    );
  }
  requestAnimationFrame(render);
}

requestAnimationFrame(render);

