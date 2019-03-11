const randomHex = require('random-hex-string').sync;

const NetRepo  = require('./netRepo').instance;
const render = require('./render');
const genId = () => `${prefix}${randomHex(2)}`.toUpperCase();

class Component {
  constructor(type, compName, pads, _genId=genId, _netRepo) {
    this.type = type;
    this.name = compName;
    this.pads = [];
    this.id = _genId();
    this.netRepo = _netRepo;

    for (let index = 0; index < pads; index++) {
      this.addPad();
    }
  }

  addPad(net) {
    const index = this.pads.length;
    const name = net
      ? net
      : `Net-(${this.name}-Pad${index+1})`;
    NetRepo.add(name)
    this.pads.push(name);
  }

  setPad(n, pad) {
    this.pads[n-1] = pad;
  }

  netForPad(n) {
    const net = this.pads[n-1];
    return NetRepo.get(net);
  }

  pad(n) {
    return this.pads[n-1];
  }

  connect(sourcePad, targetPad, targetComp) {
    const targetNet = targetComp.pad(targetPad);
    this.setPad(sourcePad, targetNet);
  }

  render(x, y, rotation) {
    const { id, name } = this;
    const netForPad = this.netForPad.bind(this);
    const data = { id, name, x, y, rotation, netForPad };

    return render(`templates/pcb/${this.type}.ejs`, { data });
  }
}

module.exports = Component;
