const fs = require('fs');
const JSZip = require('jszip');

const addFolder = (files, folder) => {
  fs.readdirSync(`${__dirname}/${folder}`).forEach(file => {
    const fileName = `${folder}/${file}`;
    if (fs.lstatSync(`${__dirname}/${fileName}`).isDirectory()) {
      addFolder(files, fileName);
    } else {
      files.push([fileName, fs.readFileSync(`${__dirname}/${fileName}`, 'utf8')]);
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
