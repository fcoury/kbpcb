const fs = require('fs');
const JSZip = require('jszip');

const addFolder = (files, folder) => {
  fs.readdirSync(`${folder}`).forEach(file => {
    const fileName = `${folder}/${file}`;
    const fileNameWithoutFootprint = fileName.replace("footprints/", "");
    if (fs.lstatSync(`${fileName}`).isDirectory()) {
      addFolder(files, fileName);
    } else {
      files.push([fileNameWithoutFootprint, fs.readFileSync(`${fileName}`, 'utf8')]);
    }
  });
}

const makeZip = (res, files) => {
  const zip = new JSZip();
  files.forEach(f => zip.file(f[0], f[1]));
  zip
    .generateNodeStream({streamFiles:true})
    .pipe(res)
    .on('finish', function () {
      res.end();
    });
};

module.exports = { addFolder, makeZip };
