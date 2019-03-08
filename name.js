// const name = `K_${ri.toString(16)}${ci.toString(16)}`;
// const name = `${n}`;
module.exports = (name) => {
  const parts = name.split('\n');
  name = parts.length > 1 ? parts[1] : parts[0];

  return name
    .split('\n')[0]
    .replace(/ /g, '_')
    .toUpperCase();
};
