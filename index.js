const fs = require('fs');
const path = require('path');
const util = require('util');
const express = require('express');
const bodyParser = require('body-parser');
const formidable = require('formidable')
const JSZip = require('jszip');

const parseLayout = require('./layout');
const genSchematics = require('./schematics');
const genPCB = require('./pcb');

const app = express();
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.raw({limit: '50mb'}));

const makeZip = (name, layout, res) => {
  res.setHeader('Content-disposition', `attachment; filename=${name}-pcb.zip`);
  const zip = new JSZip();
  zip.file(`${name}.sch`, genSchematics(layout));
  zip.file(`${name}.kicad_pcb`, genPCB(layout));
  zip
    .generateNodeStream({streamFiles:true})
    .pipe(res)
    .on('finish', function () {
      res.end();
    });
};

app.post('/submit', (req, res) => {
  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    if (err) {
      console.error('Error', err)
      throw err
    }
    console.log('files.document', files.document.toJSON());
    const { document } = files;
    const data = JSON.parse(fs.readFileSync(document.path, 'utf8'));
    const { layout } = parseLayout(data, document.name);
    const name = fields.name;
    makeZip(name, layout, res);
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
