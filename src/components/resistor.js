const Component = require('./component');

class Resistor extends Component {
  constructor(resistence) {
    super('resistor', null, 2);
    this.res = resistence;
  }

  getAdditionalData() {
    return { res: this.res };
  }
}

module.exports = Resistor;
