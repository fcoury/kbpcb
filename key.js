const fmtName = require('./name');

class Key {
  constructor(name, x, y, w, h, rotation) {
    this.name = fmtName(name);
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.size = w;
    this.rotation = rotation;
  }
}

module.exports = Key;
