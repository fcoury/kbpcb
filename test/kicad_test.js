const fs = require('fs');
const { expect } = require('chai');

const genKiCad = require('../kicad');

describe('KiCad', () => {
  it('does something', () => {
    const layout = fs.readFileSync('fixtures/elevate.json', 'utf8');
    const arr = genKiCad(layout);
    fs.writeFileSync('output/new.sch', arr[0]);
    fs.writeFileSync('output/new.kicad_pcb', arr[1]);
  });
})
