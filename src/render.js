const fs = require('fs');
const ejs = require('ejs');

const render = (template, vars) => {
  const contents = fs.readFileSync(template, 'utf8');
  return ejs.render(contents, vars);
};

module.exports = render;
