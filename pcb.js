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
    this.borders.footprint = borders.footprint || BORDER_FOOTPRINT;
    this.borders.corners   = borders.corners   || BORDER_CORNERS;
    this.borders.edge      = borders.edge ? borders.edge + this.borders.footprint : BORDER_EDGE;
  }

  generate() {
    const data = this.generateModules();
    return render('templates/pcb.ejs', data);
  }

  generateModules() {
    let size = 1; // 1u
    let cn = 0;

    const modulesArr = [];
    const netSet = new Set();
    const prefix = randomHex(2);
    const genId = () => `${prefix}${randomHex(2)}`.toUpperCase();

    let x = INIT_X * 100;
    let y = INIT_Y * 100;
    let mx = 0;
    let my = 0;

    this.layout.forEach((row, ri) => {
      row.forEach((k, ci) => {
        if (typeof k === 'object') {
          console.log('k', k);
          size = k.w || 1;
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

          const colNetIndex = [...netSet].indexOf(colNet);
          const diodeNetIndex = [...netSet].indexOf(diodeNet);
          const key = { name, size, x: x/100, y: y/100 };
          const data = { key, diodeNet, diodeNetIndex, colNet, colNetIndex, genId };
          console.log('key.size', k, key.size);
          modulesArr.push(render('templates/pcb/switch.ejs', data));
          modulesArr.push(render('templates/pcb/diode.ejs', data));
          mx = Math.max(x, mx);
          x += (1905 * size);
          size = 1;
        }
        cn++;
      });
      cn = 0;
      my = Math.max(y, my);
      y += 1905;
      x = INIT_X * 100;
    });

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

module.exports = (file) => new Pcb(file).generate();
