const { expect } = require('chai');

const NetRepo = require('../src/netRepo').instance;
const Diode = require('../src/components/diode');

describe('Diode', () => {
  let diode;

  beforeEach(() => {
    NetRepo.add('/col1');
    NetRepo.add('/row1');
    const key = { name: 'X', row: 1, col: 1 };
    diode = new Diode(key);
    console.log('diode.name', diode.name);
  });

  it('sets the name', () => {
    expect(diode.name).to.eql('D_X');
  });

  describe('rendering', () => {
    let str;

    beforeEach(() => {
      str = diode.render(10, 10);
    });

    it('sets the pads', () => {
      expect(str).to.contain('"/col1"');
      expect(str).to.contain('Net-(D_X-Pad2)');
    });
  });
});
