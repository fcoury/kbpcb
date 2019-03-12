const Component = require('./component');

class Crystal extends Component {
  constructor(k) {
    super('crystal', null, 4, 'X');
  }
}

module.exports = Crystal;
