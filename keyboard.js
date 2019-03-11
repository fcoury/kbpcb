const Key = require('./key');

class Keyboard {
  constructor(layoutStr) {
    this.layoutStr = layoutStr;
    this.json = JSON.parse(layoutStr);
    this.parseLayout();
  }

  forEach(cb) {
    this.keys.forEach(cb);
  }

  parseLayout() {
    const name = this.json[0].name || 'keyboard';
    this.layout = this.json[0].name ? this.json.slice(1) : this.json

    let x = 0;
    let y = 0;
    let rx = null;
    let ry = null;
    let rotation = null;
    let mx = 0;
    let my = 0;
    let h = null;
    let size = 1;
    let cn = 0;
    let maxCol = 0;

    this.keys = [];
    this.layout.forEach((row, ri) => {
      row.forEach((k, ci) => {
        if (typeof k === 'object') {
          size = k.w || 1;

          // height
          if (k.h) {
            h = k.h;
          }

          // rotation
          if (k.r) {
            rotation = k.r;
          }
          if (k.rx) {
            x = k.rx;
            rx = x;
          }
          if (k.ry) {
            y = k.ry;
            ry = y;
          }

          // xy adjustments
          if (k.x) {
            x += k.x;
          }
          if (k.y) {
            y += k.y;
          }
        } else {
          if (h) {
            rotation = 180;
            size = h;
            x -= 0.5;
            y += 0.5;
          }

          this.keys.push(new Key(k, x, y, size, h, rotation, ri, cn));

          x += size;
          mx = Math.max(x, mx);
          size = 1;
          maxCol = Math.max(cn, maxCol);
          cn += 1;

          if (h) {
            h = null;
            rotation = null;
            x += 0.5;
            y -= 0.5;
          }
        }
      });
      if (ry) {
        y = ry;
      } else {
        y += 1;
      }
      x = rx || 0;
      cn = 0;
      my = Math.max(y, my);
    });
    this.cols = maxCol;
    this.rows = this.layout.length;
    this.width = mx;
    this.height = my;
  }
}

module.exports = Keyboard;
