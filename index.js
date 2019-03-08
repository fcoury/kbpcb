const fs = require('fs');
const randomHex = require('random-hex-string').sync;

const parseLayout = require('./layout');
const genSchematics = require('./schematics');
const genPCB = require('./pcb');

const layout = parseLayout('fixtures/tkl.json');

fs.writeFileSync('output/matrix.sch', genSchematics(layout));
fs.writeFileSync('output/matrix.kicad_pcb', genPCB(layout));
