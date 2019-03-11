const { expect } = require('chai');

const Diode = require('../diode');

describe('Diode', () => {
  let diode;

  beforeEach(() => {
    const key = { name: 'X' };
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
      expect(str).to.contain('Net-(D_X-Pad1)');
      expect(str).to.contain('Net-(D_X-Pad2)');
    });
  });
});
