const Component = require('./component');

class Switch extends Component {
  constructor(key, leds=false) {
    super('switch', `K_${key.name}`, 4);
    this.key = key;
    this.leds = leds;
  }

  getAdditionalData() {
    return { key: this.key, leds: this.leds };
  }
}

module.exports = Switch;
