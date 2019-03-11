const Component = require('./component');

class Diode extends Component {
  constructor(key) {
    super('diode', `D_${key.name}`, 2);
  }
}

module.exports = Diode;
