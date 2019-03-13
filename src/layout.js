const fs = require('fs');
const path = require('path');

module.exports = (json, fallback) => {
  const name = json[0].name || fallback;
  return {
    name,
    layout: json[0].name ? json.slice(1) : json,
  }
};
