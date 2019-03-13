const Component = require('./component');

class Usb extends Component {
  constructor(k) {
    super('usb', null, 6, 'USB');
  }
}

module.exports = Usb;
