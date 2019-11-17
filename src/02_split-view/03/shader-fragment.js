const fragment = `

#ifdef GL_ES // Retro compatibility
  precision highp float; // high precision is set
#endif

uniform vec4 u_color;

varying vec4 v_color; // comming from vertex


void main() {
  gl_FragColor = v_color;
}
`;
