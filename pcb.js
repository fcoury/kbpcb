const fs = require('fs');
const parse = require('sexpr-plus').parse;
const randomHex = require('random-hex-string').sync;

const render = require('./render');
const getName = require('./name');

const DEBUG = false;
const INIT_X = 30;
const INIT_Y = 30;

class Pcb {
  constructor(layout) {
    this.layout = layout;
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

    let x = INIT_X * 100;
    let y = INIT_Y * 100;

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
          const genId = () => `${prefix}${randomHex(2)}`.toUpperCase();

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
          x += (1905 * size);
          size = 1;
        }
        cn++;
      });
      cn = 0;
      y += 1905;
      x = INIT_X * 100;
    });

    return {
      modules: modulesArr.join(''),
      nets: [...netSet],
    };
  }
}

module.exports = (file) => new Pcb(file).generate();
