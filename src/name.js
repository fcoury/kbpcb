const xlateMap = {
  "'": 'QUOTE',
  ';': 'SEMIC',
  ',': 'COMMA',
  '.': 'DOT',
  '/': 'SLASH',
  '\\': 'BSLSH',
  '-': 'MINUS',
  '=': 'EQUAL'
}

module.exports = (name) => {
  const parts = name.split('\n');
  name = parts.length > 1 ? parts[1] : parts[0];
  name = name.split('\n')[0].replace(/ /g, '_').toUpperCase();
  name = xlateMap[name] || name;

  return name;
};
