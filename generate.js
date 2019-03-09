const fs = require('fs');

const parseLayout = require('./layout');
const genSchematics = require('./schematics');
const genPCB = require('./pcb');

const { layout } = parseLayout(JSON.parse(fs.readFileSync('fixtures/elevate.json', 'utf8')));

// console.log('layout', layout);

fs.writeFileSync('output/matrix.sch', genSchematics(layout));
fs.writeFileSync('output/matrix.kicad_pcb', genPCB(layout));
