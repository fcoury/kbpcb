const fs = require('fs');
const parse = require('sexpr-plus').parse;
const randomHex = require('random-hex-string').sync;

const render = require('./render');
const getName = require('./name');

const DEBUG = false;
const INIT_X = 30;
const INIT_Y = 30;

const BORDER_FOOTPRINT = 5;
const BORDER_EDGE      = BORDER_FOOTPRINT + 8;
const BORDER_CORNERS   = 1;

class Pcb {
  constructor(layout, borders={}) {
    this.layout = layout;
    this.borders = {};
    this.borders.footprint = borders.footprint ? parseInt(borders.footprint, 10) : BORDER_FOOTPRINT;
    this.borders.corners   = borders.corners   ? parseInt(borders.corders, 10) : BORDER_CORNERS;
    this.borders.edge      = borders.edge      ? parseInt(borders.edge, 10) + this.borders.footprint : BORDER_EDGE;
  }

  generate() {
    const data = this.generateModules();
    return render('templates/pcb.ejs', data);
  }

  generateModules() {
    let size = 1; // 1u
    let cn = 0;

    let rotation = null;
    let rx = null;
    let ry = null;

    const modulesArr = [];
    const netSet = new Set();
    const prefix = randomHex(2);
    const genId = () => `${prefix}${randomHex(2)}`.toUpperCase();

    let x = INIT_X * 100;
    let y = INIT_Y * 100;
    let mx = 0;
    let my = 0;
    let h = null;

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
            x = (INIT_X * 100) + k.rx * 1905;
            rx = x;
          }
          if (k.ry) {
            y = (INIT_Y * 100) + k.ry * 1905;
            ry = y;
          }

          // xy adjustments
          if (k.x) {
            x += 1905 * k.x;
          }
          if (k.y) {
            y += 1905 * k.y;
          }
        } else {
          const name = getName(k);
          const colNet = `/col${ci}`;
          const diodeNet = `Net-(D_${name}-Pad2)`;
          netSet.add(colNet);
          netSet.add(diodeNet);

          if (h) {
            rotation = 180;
            size = h;
            x -= 1905 / 2;
            y += 1905 / 2;
          }

          const colNetIndex = [...netSet].indexOf(colNet);
          const diodeNetIndex = [...netSet].indexOf(diodeNet);
          const key = { name, size, x: x/100, y: y/100, rotation };
          const data = { key, diodeNet, diodeNetIndex, colNet, colNetIndex, genId };
          modulesArr.push(render('templates/pcb/switch.ejs', data));
          modulesArr.push(render('templates/pcb/diode.ejs', data));
          x += (1905 * size);
          mx = Math.max(x, mx);
          size = 1;

          if (h) {
            h = null;
            rotation = null;
            x += 1905 / 2;
            y -= 1905 / 2;
          }
        }
        cn++;
      });
      cn = 0;
      my = Math.max(y, my);
      if (ry) {
        y = ry;
      } else {
        y += 1905;
      }
      x = rx || INIT_X * 100;
    });

    // adjusts mx
    mx -= 1905;

    // frame
    const lineData = {
      x0: INIT_X - this.borders.edge,
      y0: INIT_Y - this.borders.edge,
      x1: mx/100 + this.borders.edge,
      y1: my/100 + this.borders.edge,
      border: this.borders.corners,
    };
    modulesArr.push(render('templates/pcb/frame.ejs', lineData));

    // usb port
    const width = mx - (INIT_X * 100);
    const height = my - (INIT_Y * 100);
    const data = {
      x: ((INIT_X * 100) + (width / 2)) / 100,
      y: INIT_Y - this.borders.edge + 5.5,
      genId
    };
    modulesArr.push(render('templates/pcb/usb.ejs', data));

    return {
      modules: modulesArr.join(''),
      nets: [...netSet],
    };
  }
}

module.exports = (file, borders) => new Pcb(file).generate();
