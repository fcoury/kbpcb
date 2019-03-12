const NetRepo  = require('./netRepo').instance;

const Keyboard = require('./keyboard');
const Switch = require('./switch');
const Diode = require('./diode');
const Frame = require('./frame');
const Plane = require('./plane');

const render = require('./render');

class Pcb {
  constructor(layout) {
    this.layout = layout;
    this.modules = [];
  }

  generate() {
    NetRepo.clear();
    const keyboard = new Keyboard(this.layout);

    [...Array(keyboard.cols+1)].forEach((_, i) => NetRepo.add(`/col${i}`));
    [...Array(keyboard.rows+1)].forEach((_, i) => NetRepo.add(`/row${i}`));

    keyboard.forEach(k => {
      const theSwitch = new Switch(k);
      const diode     = new Diode(k);
      theSwitch.connect(2, 2, diode);
      this.modules.push(theSwitch.render(k.x, k.y, k.rotation));
      this.modules.push(diode.render(k.x - 0.5, k.y, 90));
    });

    this.modules.push(new Frame(keyboard).render(2));
    this.modules.push(new Plane(keyboard, 'GND', 'F.Cu').render(2));
    this.modules.push(new Plane(keyboard, 'VCC', 'B.Cu').render(2));

    const modules = this.modules.join('');
    const nets = NetRepo.array;
    return render('templates/pcb.ejs', { modules, nets });
  }
}

module.exports = Pcb;
