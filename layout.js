const fs = require('fs');
const path = require('path');

module.exports = (file) => {
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  name = json[0].name || path.basename(file);

  return json[0].name ? json.slice(1) : json;
};
