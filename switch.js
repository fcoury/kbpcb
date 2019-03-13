const Component = require('./component');

class Switch extends Component {
  constructor(key) {
    super('switch', `K_${key.name}`, 4);
    this.key = key;
  }

  getAdditionalData() {
    return { key: this.key };
  }
}

module.exports = Switch;
