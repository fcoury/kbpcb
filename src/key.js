const fmtName = require('./name');

class Key {
  constructor(name, x, y, w, h, rotation, row, col) {
    this.name = fmtName(name);
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.size = w;
    this.rotation = rotation;
    this.row = row;
    this.col = col;
  }
}

module.exports = Key;
