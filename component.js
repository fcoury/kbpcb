const randomHex = require('random-hex-string').sync;

const NetRepo  = require('./netRepo').instance;
const render = require('./render');
const genId = () => `${prefix}${randomHex(2)}`.toUpperCase();

const COMP_COUNTER = Symbol.for("MrKeebs.KbPCB.ComponentCounter");

var globalSymbols = Object.getOwnPropertySymbols(global);
var exists = (globalSymbols.indexOf(COMP_COUNTER) > -1);

if (!exists) {
  global.COMP_COUNTER = {};
}

class Component {
  constructor(type, compName, pads, prefix, _genId=genId, _netRepo) {
    this.type = type;
    this.name = compName || `${prefix || type.charAt(0).toUpperCase()}${this.getNext()}`;
    this.pads = [];
    this.id = _genId();
    this.netRepo = _netRepo;
    this.initX = Component.options.initX;
    this.initY = Component.options.initY;

    for (let index = 0; index < pads; index++) {
      this.addPad();
    }
  }

  getNext() {
    const next = (global.COMP_COUNTER[this.type] || 0) + 1;
    global.COMP_COUNTER[this.type] = next;
    return next;
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

  connectPads(sourcePad, targetComp, targetPad) {
    const targetNet = targetComp.pad(targetPad);
    this.setPad(sourcePad, targetNet);
  }

  getAdditionalData(x, y, rotation) {
    return {};
  }

  render(x, y, rotation) {
    const { id, name } = this;
    const netForPad = this.netForPad.bind(this);
    const additionalData = this.getAdditionalData(x, y, rotation);
    const data = { id, name, x, y, rotation, netForPad, ...additionalData };
    data.x = data.x + Component.options.initX;
    data.y = data.y + Component.options.initY;

    return render(`templates/pcb/${this.type}.ejs`, { data });
  }

  renderSch(key) {
    const { id, name } = this;
    const x = (this.initX * 100) + (key.col * 1000);
    const y = (this.initY * 100) + (key.row * 1000);
    const data = { id, name, key, x, y };
    return render(`templates/schematics/${this.type}.ejs`, { data });
  }
}

Component.options = { initX: 0, initY: 0 };

module.exports = Component;
