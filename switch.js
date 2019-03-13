const Component = require('./component');

class Switch extends Component {
  constructor(key, leds=false) {
    super('switch', `K_${key.name}`, 4);
    this.key = key;
    this.leds = leds;
  }

  getAdditionalData(x, y, rotation) {
    return {
      key: this.key,
      leds: this.leds,
      x: ((x + 0.5 + ((this.key.size-1)/2)) * 1905) / 100,
      y: ((y + 0.5) * 1905) / 100,
    };
  }
}

module.exports = Switch;
