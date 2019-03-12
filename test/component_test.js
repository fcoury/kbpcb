const Component = require('../component');
const { expect } = require('chai');

require('../id');

const comp = new Component('test', 'D1', 2, () => 123);

describe('Component', () => {
  context('rendering', () => {
    it('sets the id', () => {
      expect(comp.render(10, 15)).to.contain('(tstamp 123)');
    });

    it('sets position with no rotation', () => {
      expect(comp.render(10, 15)).to.contain('(at 10 15 )');
    });

    it('sets position with rotation', () => {
      expect(comp.render(10, 15, 45)).to.contain('(at 10 15 45)');
    });

    it('sets reference', () => {
      expect(comp.render(10, 15, 45)).to.contain('(fp_text reference D1');
    });

    it('renders default pads', () => {
      const str = comp.render(10, 15);
      expect(str).to.contain('(net 1 "Net-(D1-Pad1)")');
      expect(str).to.contain('(net 2 "Net-(D1-Pad2)")');
    });

    it('renders connected nets', () => {
      const comp1 = new Component('test', 'D1', 2, () => 123);
      const comp2 = new Component('test', 'D2', 2, () => 123);
      comp1.connectPads(1, comp2, 2);

      const str = comp1.render(10, 15);
      expect(str).to.contain('"Net-(D2-Pad2)"');
    });
  });
});
