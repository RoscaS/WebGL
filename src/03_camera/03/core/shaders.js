/*------------------------------------------------------------------*\
 |*							                  OBJECT
 \*------------------------------------------------------------------*/
const vertexA = `
attribute vec4 a_position;
attribute vec4 a_color;

varying vec4 v_color;
uniform mat4 u_matrix;

void main() {
   gl_Position = u_matrix * a_position;
   v_color = a_color;
}
`;

const fragmentA = `
#ifdef GL_ES
  precision highp float; 
#endif

varying vec4 v_color;

void main() {
 gl_FragColor = v_color;
}
`;

/*------------------------------------------------------------------*\
 |*							               CAMERA & FROSTRUM
 \*------------------------------------------------------------------*/
const vertexB = `
attribute vec4 a_position;
uniform mat4 u_matrix;

void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;
}
`;

const fragmentB = `
#ifdef GL_ES
  precision highp float; 
#endif

uniform vec4 u_color;

void main() {
  gl_FragColor = u_color;
}
`;
