const Rectangular = require('./rectangular');

class Frame extends Rectangular {
  constructor(kb, name, layer, gap=2) {
    super(kb, 'frame', name, gap);
    this.layer = layer;
  }
}

module.exports = Frame;
