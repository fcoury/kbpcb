const Component = require('./component');

class Diode extends Component {
  constructor(k) {
    super('diode', `D_${k.name}`, 2);
    this.setPad(1, `/col${k.col}`);
  }

  getAdditionalData(x, y, options) {
    return {
      x: ((x + 0.5) * 1905) / 100,
      y: ((y + 0.5) * 1905) / 100,
    };
  }
}

module.exports = Diode;
