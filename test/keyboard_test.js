const fs = require('fs');
const { expect } = require('chai');

const Keyboard = require('../src/keyboard');

describe('Keyboard', () => {
  it('does something', () => {
    const layout = fs.readFileSync('fixtures/60.json', 'utf8')
    const k = new Keyboard(layout);
    // expect(k.keys[0]).to.eql('');
  });
})
