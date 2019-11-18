class ShapeBase {
  constructor(gl, program) {
    this.gl = gl;
    this.program = program;

    this.vertex = null;
    this.indices = null;

    this.uniformesNames = [];
    this.attributesNames = [];

    this.initAttributes();
    this.initUniforms();
  }

  initAttributes(attributes) {
    attributes.forEach(attr => this.initAttribute(attr))
  }

  initUniforms(uniformes) {
    uniformes.forEach(uni => this.initAttribute(uni))
  }

  initAttribute(name) {
    const GLSLname = `a_${name}`;
    const memberName = `${name}AttributeLocation`;
    this[memberName] = this.gl.getAttribLocation(this.program, GLSLname)
  }

  initUniform(name) {
    const GLSLname = `u_${name}`;
    const memberName = `${name}UniformLocation`;
    this[memberName] = this.gl.getUniformLocation(this.program, GLSLname)
  }


}
