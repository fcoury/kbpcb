const Component = require('./component');

class Rectangular extends Component {
  constructor(kb, type, name) {
    super(type, name);
    this.x = 0;
    this.y = 0;
    this.x1 = (kb.width * 1905)/100;
    this.y1 = (kb.height * 1905)/100;
  }

  getAdditionalData() {
    const { x1, y1 } = this;
    return { x1, y1 };
  }

  render() {
    return super.render(this.x, this.y);
  }
}

module.exports = Rectangular;
