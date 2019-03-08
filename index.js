const fs = require('fs');
const randomHex = require('random-hex-string').sync;
const render = require('./render');

const X_INIT = 1300;
const Y_INIT = 1100;
const X_INCR = 700;
const Y_INCR = 800;

const json = JSON.parse(fs.readFileSync('fixtures/butterfly.json', 'utf8'));
const name = json[0].name;
const layout = json.slice(1);
const prefix = randomHex(2);

let x = X_INIT;
let y = Y_INIT;
let n = 0;
let size = 1; // 1u

const componentsArr = [];
layout.forEach((row, ri) => {
  row.forEach((k, ci) => {
    if (typeof k === 'object') {
      size = k.w || 1;
    } else {
      // const name = `K_${k.toUpperCase()}`;
      // const name = `K_${ri.toString(16)}${ci.toString(16)}`;
      const genId = () => `${prefix}${randomHex(2)}`.toUpperCase();
      const name = `${n}`;
      const key = Object.freeze({ name, x, y, size });
      const data = Object.freeze({ genId, key });
      componentsArr.push(render('templates/switch.ejs', data));
      componentsArr.push(render('templates/diode.ejs', data));
      x += X_INCR;
      n++;
      size = 1;
    }
  });
  y += Y_INCR;
  x = X_INIT;
});

const components = componentsArr.join('');
const schematics = render('templates/matrix.ejs', { components });

fs.writeFileSync('output/matrix.sch', schematics);
