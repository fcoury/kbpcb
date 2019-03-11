const Rectangular = require('./rectangular');

class Plane extends Rectangular {
  constructor(kb, name, layer) {
    super(kb, 'plane', name);
    this.layer = layer;
  }

  getAdditionalData() {
    return { ...super.getAdditionalData(), layer: this.layer };
  }
}

module.exports = Plane;
