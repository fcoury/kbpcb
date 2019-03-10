const fs = require('fs');
const path = require('path');
const util = require('util');
const express = require('express');
const bodyParser = require('body-parser');
const formidable = require('formidable')

const parseLayout = require('./layout');
const genSchematics = require('./schematics');
const genPCB = require('./pcb');

const { addFolder, makeZip } = require('./zip');

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
      console.log('files.document', files.document.toJSON());
      const { document } = files;
      const docName = path.basename(document.name).split('.')[0];
      const data = JSON.parse(fs.readFileSync(document.path, 'utf8'));
      const { layout } = parseLayout(data, docName);
      const name = fields.name || docName;
      console.log('fields', fields);
      const borders = {
        edge:    fields.borderSpacing,
        corners: fields.borderRound,
      };

      const zipFiles = [
        [`${name}.pro`, fs.readFileSync('templates/project.pro')],
        [`${name}.sch`, genSchematics(layout).matrix],
        [`${name}.kicad_pcb`, genPCB(layout, borders)],
        [`sym-lib-table`, fs.readFileSync('templates/sym-lib-table')],
        [`fp-lib-table`, fs.readFileSync('templates/fp-lib-table')],
      ];
      addFolder(zipFiles, 'kicad_lib_tmk');
      addFolder(zipFiles, 'keyboard_parts.pretty');
      addFolder(zipFiles, 'MX_Alps_Hybrid.pretty');

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}!`);
});
