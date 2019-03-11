const Keyboard = require('./keyboard');
const Switch = require('./switch');
const Diode = require('./diode');
const NetRepo  = require('./netRepo').instance;

const render = require('./render');

class Pcb {
  constructor(layout) {
    this.layout = layout;
    this.modules = [];
  }

  generate() {
    NetRepo.clear();
    const keyboard = new Keyboard(this.layout);
    keyboard.forEach(k => {
      const theSwitch = new Switch(k);
      const diode     = new Diode(k);
      theSwitch.connect(2, 2, diode);
      this.modules.push(theSwitch.render(k.x, k.y, k.rotation));
      this.modules.push(diode.render(k.x - 0.5, k.y, 90));
    });

    const modules = this.modules.join('');
    const nets = NetRepo.array;
    return render('templates/pcb.ejs', { modules, nets });
  }
}

module.exports = Pcb;
