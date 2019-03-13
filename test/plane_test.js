const Plane = require('../src/components/plane');

describe('Plane', () => {
  it('returns the coordinates', () => {
    const kb = { length: 10, width: 20 };
    const plane = new Plane(kb, 'GND', 'F.Cu');
  });
});
