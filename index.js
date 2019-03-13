const fs = require('fs');
const path = require('path');
const util = require('util');
const express = require('express');
const bodyParser = require('body-parser');
const formidable = require('formidable')

require('./src/id');

const parseLayout = require('./src/layout');
const genSchematics = require('./src/schematics');
const genKiCad = require('./src/kicad');

const { addFolder, makeZip } = require('./src/zip');

const app = express();
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.raw({limit: '50mb'}));

app.post('/submit', (req, res) => {
  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    try {
      if (err) {
        console.error('Error', err)
        throw err
      }
      if (files.document.type !== 'application/json') {
        return res.redirect('/?error=Only+JSON+files+accepted');
      }
      const { document } = files;
      const docName = path.basename(document.name).split('.')[0];
      const name = fields.name || docName;
      const options = {
        leds: !!fields.leds,
        x: 20,
        y: 20,
      };
      const kicad = genKiCad(
        fs.readFileSync(document.path, 'utf8'),
        options);
      const zipFiles = [
        [`${name}.pro`, fs.readFileSync('templates/project.pro')],
        [`${name}.sch`, kicad[0]],
        [`${name}.kicad_pcb`, kicad[1]],
        [`sym-lib-table`, fs.readFileSync('templates/sym-lib-table')],
        [`fp-lib-table`, fs.readFileSync('templates/fp-lib-table')],
      ];
      addFolder(zipFiles, 'footprints/kicad_lib_tmk');
      addFolder(zipFiles, 'footprints/keyboard_parts.pretty');
      addFolder(zipFiles, 'footprints/MX_Alps_Hybrid.pretty');

      zip = makeZip(res, zipFiles);

      res.setHeader('Content-disposition', `attachment; filename=${name}-pcb.zip`);
    } catch (err) {
      console.log('err', err);
      res.status(500).send(`<html><body><p>Error in ${req.method} ${req.url}<p><pre>${err.stack}</pre></body></html>`);
    }
  });
});

app.post('/generate', (req, res) => {
  const { layout, name } = parseLayout(req.body, 'matrix');
  makeZip(name, layout, res);
});

app.use('/', express.static('static'));

const port = process.env.PORT || 3001;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}!`);
});
