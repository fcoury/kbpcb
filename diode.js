const Component = require('./component');

class Diode extends Component {
  constructor(k) {
    super('diode', `D_${k.name}`, 2);
    this.setPad(1, `/col${k.col}`);
  }
}

module.exports = Diode;
