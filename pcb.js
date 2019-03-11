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

const prefix = randomHex(2);
const genId = () => `${prefix}${randomHex(2)}`.toUpperCase();

class Pcb {
  constructor(layout, borders={}) {
    this.layout = layout;
    this.borders = {};
    this.borders.footprint = borders.footprint ? parseInt(borders.footprint, 10) : BORDER_FOOTPRINT;
    this.borders.corners   = borders.corners   ? parseInt(borders.corders, 10) : BORDER_CORNERS;
    this.borders.edge      = borders.edge      ? parseInt(borders.edge, 10) + this.borders.footprint : BORDER_EDGE;
  }

  generate() {
    this.modulesArr = [];
    this.netSet     = new Set();

    const data = this.generateModules();
    return render('templates/pcb.ejs', data);
  }

  addNet(name, formatted=true) {
    const fmtName = formatted ? `Net-(${name})` : name;
    this.netSet.add(fmtName);
    return fmtName;
  }

  netIdx(name, formatted=false) {
    if (formatted) {
      return [...this.netSet].indexOf(`Net-(${name})`);
    } else {
      return [...this.netSet].indexOf(name);
    }
  }

  addComponent(type, name, data) {
    const net = this.addNet(`${name}-Pad1`);
    const compData = {
      name,
      rotation: null,
      net,
      netIndex: this.netIdx(net),
      genId,
      ...data,
    };
    // console.log(name, 'compData', data);
    // console.log(name, 'data', data);
    this.modulesArr.push(render(`templates/pcb/${type}.ejs`, compData));
  }

  addCap(name, data) {
    this.addComponent('cap', name, data);
  }

  addResistor(name, data) {
    this.addNet(`${name}-Pad2`)
    this.addComponent('resistor', name, data);
  }

  generateModules() {
    let size = 1; // 1u
    let cn = 0;

    let rotation = null;
    let rx = null;
    let ry = null;

    this.addNet('GND', false);
    this.addNet('VCC', false);

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
          this.addNet(`D_${name}-Pad2`)

          const colNet = this.addNet(`/col${ci}`);
          const diodeNet = this.addNet(`D_${name}-Pad2`);

          if (h) {
            rotation = 180;
            size = h;
            x -= 1905 / 2;
            y += 1905 / 2;
          }

          const colNetIndex = this.netIdx(colNet);
          const diodeNetIndex = this.netIdx(diodeNet);
          const key = { name, size, x: x/100, y: y/100, rotation };
          const data = { key, diodeNet, diodeNetIndex, colNet, colNetIndex, genId };
          this.modulesArr.push(render('templates/pcb/switch.ejs', data));
          this.modulesArr.push(render('templates/pcb/diode.ejs', data));
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

    // frame and planes
    const lineData = {
      x0: INIT_X - this.borders.edge,
      y0: INIT_Y - this.borders.edge,
      x1: mx/100 + this.borders.edge,
      y1: my/100 + this.borders.edge,
      border: this.borders.corners,
    };
    this.modulesArr.push(render('templates/pcb/frame.ejs', { ...lineData }));

    // nets
    this.addNet('J1-Pad2');
    this.addNet('J1-Pad3');
    this.addNet('J1-Pad4');

    this.addNet('U1-Pad3');
    this.addNet('U1-Pad4');
    this.addNet('U1-Pad7');
    this.addNet('U1-Pad12');
    this.addNet('U1-Pad21');
    this.addNet('U1-Pad22');
    this.addNet('U1-Pad25');
    this.addNet('U1-Pad26');
    this.addNet('U1-Pad27');
    this.addNet('U1-Pad34');
    this.addNet('U1-Pad35');
    this.addNet('U1-Pad36');
    this.addNet('U1-Pad42');
    this.addNet('U1-Pad43');
    this.addNet('U1-Pad44');

    // crystal capacitors
    this.addCap('XC1', {
      x: mx/100 + this.borders.edge + 10,
      y: INIT_Y,
      rotation: 90,
    });
    this.addCap('XC2', {
      x: mx/100 + this.borders.edge + 20,
      y: INIT_Y,
      rotation: 90,
    });

    // ground and VCC planes
    this.modulesArr.push(render('templates/pcb/plane.ejs', { ...lineData, layer: 'F.Cu', netName: 'GND' }));
    this.modulesArr.push(render('templates/pcb/plane.ejs', { ...lineData, layer: 'B.Cu', netName: 'VCC' }));

    // microcontroller capacitors
    this.addCap('C1', {
      x: mx/100 + this.borders.edge + 23,
      y: INIT_Y + 15,
      rotation: 90,
    });
    this.addCap('C2', {
      x: mx/100 + this.borders.edge + 23,
      y: INIT_Y + 5,
      rotation: 90,
    });
    this.addCap('C3', {
      x: mx/100 + this.borders.edge + 5,
      y: INIT_Y + 5,
      rotation: 90,
    });
    this.addCap('C4', {
      x: mx/100 + this.borders.edge + 5,
      y: INIT_Y,
      rotation: 90,
    });
    this.addCap('C5', {
      x: mx/100 + this.borders.edge + 5,
      y: INIT_Y + 15,
      rotation: 90,
    });
    this.addCap('C6', {
      x: mx/100 + this.borders.edge + 5,
      y: INIT_Y + 10,
      rotation: 90,
    });

    // resistors
    this.addResistor('R1', {
      x: mx/100 + this.borders.edge + 5,
      y: INIT_Y + 25,
      rotation: 90,
      res: '10k',
    });
    this.addResistor('R2', {
      x: mx/100 + this.borders.edge + 23,
      y: INIT_Y + 10,
      rotation: 90,
      res: '10k',
    });
    this.addResistor('R3', {
      x: mx/100 + this.borders.edge + 5,
      y: INIT_Y - 10,
      res: '22',
      net: {
        pad1: { name: 'Net-(U1-Pad3)', index: this.netIdx('Net-(U1-Pad3)') },
        pad2: { name: 'Net-(J1-Pad2)', index: this.netIdx('Net-(J1-Pad2)') },
      },
    });
    this.addResistor('R4', {
      x: mx/100 + this.borders.edge + 10,
      y: INIT_Y - 10,
      res: '22',
      net: {
        pad1: { name: 'Net-(U1-Pad4)', index: this.netIdx('Net-(U1-Pad4)') },
        pad2: { name: 'Net-(J1-Pad3)', index: this.netIdx('Net-(J1-Pad3)') },
      },
    });
    this.addNet('R1-Pad2');
    this.addNet('R2-Pad2');
    this.addNet('R3-Pad2');
    this.addNet('R4-Pad2');

    // reset
    this.addComponent('reset', 'SW1', {
      x: mx/100 + this.borders.edge + 14,
      y: INIT_Y + 25,
      net: 'Net-(R1-Pad1)',
      netIndex: this.netIdx('Net-(R1-Pad1)'),
    });

    // usb port
    const width = mx - (INIT_X * 100);
    const height = my - (INIT_Y * 100);
    const usbData = {
      x: ((INIT_X * 100) + (width / 2)) / 100,
      y: INIT_Y - this.borders.edge + 5.5,
      net: {
        pad2: { index: this.netIdx('Net-(J1-Pad2)'), name: 'Net-(J1-Pad2)' },
        pad3: { index: this.netIdx('Net-(J1-Pad3)'), name: 'Net-(J1-Pad3)' },
        pad4: { index: this.netIdx('Net-(J1-Pad4)'), name: 'Net-(J1-Pad4)' },
      },
      genId,
    };
    this.modulesArr.push(render('templates/pcb/usb.ejs', usbData));

    // crystal
    const crystalData = {
      name: 'X1',
      x: mx/100 + this.borders.edge + 15,
      y: INIT_Y,
      rotation: null,
      c1Net: 'Net-(XC1-Pad1)',
      c1NetIndex: [...this.netSet].indexOf('Net-(XC1-Pad1)'),
      c2Net: 'Net-(XC2-Pad1)',
      c2NetIndex: [...this.netSet].indexOf('Net-(XC2-Pad1)'),
      genId,
    };
    this.modulesArr.push(render('templates/pcb/crystal.ejs', crystalData));

    // microcontroller
    const microNet = this.addNet('U1-Pad1');
    const microData = {
      name: 'U1',
      x: mx/100 + this.borders.edge + 14,
      y: INIT_Y + 10,
      rotation: null,
      net: {
        pad1: { name: 'Net-(U1-Pad1)', index: this.netIdx('Net-(U1-Pad1)') },
        pad3: { name: 'Net-(R3-Pad1)', index: this.netIdx('Net-(R3-Pad1)') },
        pad4: { name: 'Net-(R4-Pad1)', index: this.netIdx('Net-(R4-Pad1)') },
        pad6: { name: 'Net-(C6-Pad1)', index: this.netIdx('Net-(C6-Pad1)') },
        pad7: { name: 'Net-(U1-Pad7)', index: this.netIdx('Net-(U1-Pad7)') },
        // pad8: { name: 'Net-(C6-Pad1)', index: this.netIdx('Net-(C6-Pad1)') },
        // pad9: { name: 'Net-(C6-Pad1)', index: this.netIdx('Net-(C6-Pad1)') },
        // pad10: { name: 'Net-(C6-Pad1)', index: this.netIdx('Net-(C6-Pad1)') },
        // pad11: { name: 'Net-(C6-Pad1)', index: this.netIdx('Net-(C6-Pad1)') },
        pad12: { name: 'Net-(U1-Pad12)', index: this.netIdx('Net-(U1-Pad12)') },
        pad13: { name: 'Net-(R1-Pad1)', index: this.netIdx('Net-(R1-Pad1)') },
        pad16: { name: 'Net-(C1-Pad1)', index: this.netIdx('Net-(C1-Pad1)') },
        pad17: { name: 'Net-(C2-Pad1)', index: this.netIdx('Net-(C2-Pad1)') },
        // pad18: { name: 'Net-(C6-Pad1)', index: this.netIdx('Net-(C6-Pad1)') },
        // pad19: { name: 'Net-(C6-Pad1)', index: this.netIdx('Net-(C6-Pad1)') },
        // pad20: { name: 'Net-(C6-Pad1)', index: this.netIdx('Net-(C6-Pad1)') },
        pad21: { name: 'Net-(U1-Pad21)', index: this.netIdx('Net-(U1-Pad21)') },
        pad22: { name: 'Net-(U1-Pad22)', index: this.netIdx('Net-(U1-Pad22)') },
        pad25: { name: 'Net-(U1-Pad25)', index: this.netIdx('Net-(U1-Pad25)') },
        pad26: { name: 'Net-(U1-Pad26)', index: this.netIdx('Net-(U1-Pad26)') },
        pad27: { name: 'Net-(U1-Pad27)', index: this.netIdx('Net-(U1-Pad27)') },
        // pad28: { name: 'Net-(C6-Pad1)', index: this.netIdx('Net-(C6-Pad1)') },
        // pad29: { name: 'Net-(C6-Pad1)', index: this.netIdx('Net-(C6-Pad1)') },
        // pad30: { name: 'Net-(C6-Pad1)', index: this.netIdx('Net-(C6-Pad1)') },
        // pad31: { name: 'Net-(C6-Pad1)', index: this.netIdx('Net-(C6-Pad1)') },
        // pad32: { name: 'Net-(C6-Pad1)', index: this.netIdx('Net-(C6-Pad1)') },
        pad33: { name: 'Net-(R2-Pad2)', index: this.netIdx('Net-(R2-Pad2)') },
        pad34: { name: 'Net-(U1-Pad34)', index: this.netIdx('Net-(U1-Pad34)') },
        pad35: { name: 'Net-(U1-Pad35)', index: this.netIdx('Net-(U1-Pad35)') },
        pad36: { name: 'Net-(U1-Pad36)', index: this.netIdx('Net-(U1-Pad36)') },
        // pad37: { name: 'Net-(C6-Pad1)', index: this.netIdx('Net-(C6-Pad1)') },
        // pad38: { name: 'Net-(C6-Pad1)', index: this.netIdx('Net-(C6-Pad1)') },
        // pad39: { name: 'Net-(C6-Pad1)', index: this.netIdx('Net-(C6-Pad1)') },
        // pad40: { name: 'Net-(C6-Pad1)', index: this.netIdx('Net-(C6-Pad1)') },
        // pad41: { name: 'Net-(C6-Pad1)', index: this.netIdx('Net-(C6-Pad1)') },
        pad42: { name: 'Net-(U1-Pad42)', index: this.netIdx('Net-(U1-Pad42)') },
        pad43: { name: 'Net-(U1-Pad43)', index: this.netIdx('Net-(U1-Pad43)') },
        pad44: { name: 'Net-(U1-Pad44)', index: this.netIdx('Net-(U1-Pad44)') },
      },
      genId,
    };
    this.modulesArr.push(render('templates/pcb/micro.ejs', microData));

    return {
      modules: this.modulesArr.join(''),
      nets: [...this.netSet],
    };
  }
}

module.exports = (file, borders) => new Pcb(file).generate();
