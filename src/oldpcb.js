const fs = require('fs');
const render = require('./render');
const parse = require("sexpr-plus").parse;
const getName = require('./name');

const DEBUG = false;

class Pcb {
  constructor(layout) {
    this.layout = layout;
  }

  generate() {
    const components = this.generateComponents();
    return render('templates/pcb.ejs', { components });
  }

  generateComponents() {
    let size = 1; // 1u
    let cn = 0;

    const modulesArr = [];
    const netSet = new Set();

    this.layout.forEach((row, ri) => {
      row.forEach((k, ci) => {
        if (typeof k === 'object') {
          size = k.w || 1;
        } else {

          const name = getName(k);
          const colNet = `col_${ci}`;
          const diodeNet = `Net-(D_${k}-Pad2)`;
          netSet.add(colNet);
          netSet.add(diodeNet);

          const colNetIndex = [...netSet].indexOf(diodeNet);
          const diodeNetIndex = [...netSet].indexOf(diodeNet);
          const key = { name, size, diodeNet, diodeNetIndex, colNet, colNetIndex };
          modulesArr.push(render('templates/pcb/switch.ejs', data));
        }
        cn++;
        size = 1;
      });
      cn = 0;
    });

    const source = fs.readFileSync(`MX_ALPS_Hybrid.pretty/MX-${size}U-NoLED.kicad_mod`, 'utf8');
    const sexpr = parse(source);
    const lines = source.split('\n');
    // const res = this.serialize(lines, sexpr);
    // console.log(res);

    const res = [];
    this.process(sexpr, (type, sexpr, content) => {
      if (type === 'atom' && content === 'module') {
        console.log('module', sexpr);
      }
    });
  }

  process(sexpr, eventCallback) {
    if (!sexpr) { return; }
    const { type, content } = sexpr;
    // console.log('content', sexpr);
    if (Array.isArray(content)) {
      this.process(content, eventCallback);
    } else if (Array.isArray(sexpr)) {
      sexpr.forEach(s => this.process(s, eventCallback));
    };
    eventCallback(type, sexpr, content);
  }

  serialize(lines, sexpr, lvl) {
    lvl = lvl || 0;
    if (!sexpr) {
      return;
    }
    const type = sexpr.type || 'array';
    if (DEBUG) console.log(' '.repeat(lvl*2), 'type', type);
    if (type === 'list') {
      if (DEBUG) console.log(' '.repeat(lvl*2), 'content', sexpr.content.length);
      const res = this.serialize(lines, sexpr.content, lvl + 1);
      if (DEBUG) console.log(' '.repeat(lvl*2), 'content - res', res);
      return `(${res})`;
    } else if (type === 'atom') {
      const { content, location } = sexpr;
      if (DEBUG) console.log(' '.repeat(lvl*2), 'atom', content);
      return content;
    } else if (type === 'string') {
      const { content, location } = sexpr;
      if (DEBUG) console.log(' '.repeat(lvl*2), 'atom', content);
      return `"${content}`;
    } else if (sexpr.length) {
      if (DEBUG) console.log(' '.repeat(lvl*2), 'array');
      return sexpr.map(s => {
        return this.serialize(lines, s, lvl+1)
      }).join(' ');
    } else {
      if (DEBUG) console.log(' *** UNKNOWN', sexpr);
      throw `Unknown expression - ${JSON.stringify(sexpr)}`;
    }
  }
}

module.exports = (file) => new Pcb(file).generate();
