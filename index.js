const fs = require('fs');
const randomHex = require('random-hex-string').sync;
const render = require('./render');
const genSchematics = require('./schematics');

fs.writeFileSync('output/matrix.sch', genSchematics('fixtures/tkl.json'));
