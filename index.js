const fs = require('fs');
const randomHex = require('random-hex-string').sync;
const render = require('./render');

const INITIAL_X = 1300;

const json = JSON.parse(fs.readFileSync('fixtures/butterfly.json', 'utf8'));
const name = json[0].name;
const layout = json.slice(1);
const prefix = randomHex(2);

let x = INITIAL_X;
let y = 1100;
let n = 0;

const componentsArr = [];
layout.forEach((row, ri) => {
  row.forEach((k, ci) => {
    if (typeof k === 'object') {

    } else {
      // const name = `K_${k.toUpperCase()}`;
      // const name = `K_${ri.toString(16)}${ci.toString(16)}`;
      const genId = () => `${prefix}${randomHex(2)}`.toUpperCase();
      const name = `${n}`;
      const key = { name, x, y };
      const data = { genId, key };
      componentsArr.push(render('templates/switch.ejs', data));
      componentsArr.push(render('templates/diode.ejs', data));
      x += 700;
      n++;
    }
  });
  y += 800;
  x = INITIAL_X;
});

const components = componentsArr.join('');
const schematics = render('templates/schematics.ejs', { components });

fs.writeFileSync('output/matrix.sch', schematics);
