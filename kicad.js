const NetRepo  = require('./netRepo').instance;

const Keyboard = require('./keyboard');
const Component = require('./component');
const Switch = require('./switch');
const Cap = require('./cap');
const Diode = require('./diode');
const Resistor = require('./resistor');
const Frame = require('./frame');
const Plane = require('./plane');
const Usb = require('./usb');
const Reset = require('./reset');
const Crystal = require('./crystal');
const Micro = require('./micro');

const render = require('./render');

class KiCad {
  constructor(layout, options={}) {
    this.layout = layout;
    this.modules = [];
    this.components = [];
    this.gap = options.gap || 3;
    this.leds = options.leds;
    Component.options.initX = options.x || 0;
    Component.options.initY = options.y || 0;
  }

  generate() {
    NetRepo.clear();
    const keyboard = new Keyboard(this.layout);

    [...Array(keyboard.cols+1)].forEach((_, i) => NetRepo.add(`/col${i}`));
    [...Array(keyboard.rows+1)].forEach((_, i) => NetRepo.add(`/row${i}`));

    keyboard.forEach(k => {
      const theSwitch = new Switch(k, this.leds);
      const diode     = new Diode(k);
      theSwitch.connectPads(2, diode, 2);
      this.modules.push(theSwitch.render(k.x, k.y, k.rotation));
      this.modules.push(diode.render(k.x - 0.5, k.y, 90));
      this.components.push(theSwitch.renderSch(k))
    });

    this.modules.push(new Frame(keyboard).render(this.gap));
    this.modules.push(new Plane(keyboard, 'GND', 'F.Cu').render(this.gap + 1));
    this.modules.push(new Plane(keyboard, 'VCC', 'B.Cu').render(this.gap + 1));

    const limitx = (keyboard.width * 1905) / 100;

    const xCap1 = new Cap();
    const xc1x = limitx + 5;
    const xc1y = 20;

    const xCap2 = new Cap();
    const xc2x = limitx + 15;
    const xc2y = 20;

    const crystal = new Crystal();
    const xx = limitx + 10;
    const xy = 20;

    crystal.connectPads(1, xCap1, 1);
    crystal.connectPads(1, xCap2, 2);

    this.modules.push(xCap1.render(xc1x, xc1y));
    this.modules.push(xCap2.render(xc2x, xc2y));
    this.modules.push(crystal.render(xx, xy));

    // microcontroller
    const r1 = new Resistor('10k');
    r1.setPad(2, 'VCC');
    const r1x = limitx + 14;
    const r1y = -5;

    const reset = new Reset();
    const rx = limitx + 14;
    const ry = -10;
    reset.connectPads(2, r1, 1);

    const r2 = new Resistor('10k');
    r2.setPad(2, 'GND');
    const r2x = limitx + 25;
    const r2y = 8;

    const r3 = new Resistor('22u');
    const r3x = limitx + 5;
    const r3y = 8;

    const r4 = new Resistor('22u');
    const r4x = limitx + 5;
    const r4y = 12;

    const usb = new Usb();
    const ux = limitx / 2;
    const uy = this.gap + 2;

    r3.connectPads(2, usb, 2);
    r4.connectPads(2, usb, 3);

    const uCap1 = new Cap(); // old C8
    const uc1x = limitx + 5;
    const uc1y = 5;

    const micro = new Micro();
    const mx = limitx + 14;
    const my = 5;

    micro.connectPads(3, r3, 1);
    micro.connectPads(4, r4, 1);
    micro.connectPads(6, uCap1, 1);
    micro.connectPads(13, r1, 1);
    micro.connectPads(16, xCap1, 1);
    micro.connectPads(17, xCap2, 1);
    micro.connectPads(33, r2, 1);

    const padMatrixOrder = [
      [18, 19, 20, 21, 25, 22, 26],                                // rows
      [41, 40, 39, 38, 37, 8, 9, 10, 11, 28, 29, 30, 12, 31, 32],  // columns
    ];

    [...Array(keyboard.rows)].forEach((_, r) => {
      const pad = padMatrixOrder[0].pop();
      micro.setPad(pad, `/row${r}`);
    });

    [...Array(keyboard.cols)].forEach((_, c) => {
      const pad = padMatrixOrder[1].pop();
      micro.setPad(pad, `/col${c}`);
    });

    this.modules.push(r1.render(r1x, r1y));
    this.modules.push(reset.render(rx, ry));
    this.modules.push(r2.render(r2x, r2y));
    this.modules.push(r3.render(r3x, r3y));
    this.modules.push(r4.render(r4x, r4y));
    this.modules.push(usb.render(ux, uy));
    this.modules.push(uCap1.render(uc1x, uc1y));
    this.modules.push(micro.render(mx, my));

    // decoupling capacitors
    [...Array(4)].forEach((_, i) => {
      const dCap = new Cap();
      dCap.setPad(1, 'VCC');
      this.modules.push(dCap.render(limitx + 5 + (i*5), 30));
    });

    const modules = this.modules.join('');
    const components = this.components.join('');
    const nets = NetRepo.array;
    return [
      render('templates/matrix.ejs', { components, nets }),
      render('templates/pcb.ejs', { modules, nets }),
    ];
  }
}

module.exports = (file, options) => new KiCad(file, options).generate();
