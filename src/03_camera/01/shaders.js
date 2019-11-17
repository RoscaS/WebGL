/*------------------------------------------------------------------*\
 |*							                  MAIN
 \*------------------------------------------------------------------*/
const vertex = `
/*---------------------------------*\
|*             VERTEX
\*---------------------------------*/
attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_matrix;
varying vec4 v_color;

void main() {
   gl_Position = u_matrix * a_position;
   v_color = a_color;
}
`;

const fragment = `
/*---------------------------------*\
|*            FRAGMENT
\*---------------------------------*/
#ifdef GL_ES
  precision highp float; 
#endif

varying vec4 v_color;

void main() {
 gl_FragColor = v_color;
}
`;

/*------------------------------------------------------------------*\
 |*							               SOLID COLOR
 \*------------------------------------------------------------------*/
const sVertex = `
/*---------------------------------*\
|*             VERTEX
\*---------------------------------*/
attribute vec4 a_position;
uniform mat4 u_matrix;

void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;
}
`;

const sFragment = `
/*---------------------------------*\
|*             FRAGMENT
\*---------------------------------*/
#ifdef GL_ES
  precision highp float; 
#endif

uniform vec4 u_color;

void main() {
  gl_FragColor = u_color;
}
`;
