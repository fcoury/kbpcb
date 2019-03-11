const fs = require('fs');
const { expect } = require('chai');

const Pcb = require('../pcb');

describe.only('Pcb', () => {
  it('does something', () => {
    const layout = fs.readFileSync('fixtures/60.json', 'utf8');
    const pcb = new Pcb(layout);
    const str = pcb.generate();
    fs.writeFileSync('output/new.kicad_pcb', str);
  });
})
