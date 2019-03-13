const fs = require('fs');

const parseLayout = require('./layout');
const genSchematics = require('./schematics');
const genPCB = require('./pcb');

const { layout } = parseLayout(JSON.parse(fs.readFileSync('fixtures/elevate.json', 'utf8')));

// console.log('layout', layout);

const { main, matrix } = genSchematics(layout);
fs.writeFileSync('output/Main.sch', main);
fs.writeFileSync('output/matrix.sch', matrix);
fs.writeFileSync('output/Main.kicad_pcb', genPCB(layout));
