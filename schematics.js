const randomHex = require('random-hex-string').sync;
const render = require('./render');
const getName = require('./name');

const X_INIT = 1300;
const Y_INIT = 1100;
const X_INCR = 700;
const Y_INCR = 800;
const COL_LABEL_X_GAP = 550;
const COL_LABEL_Y_GAP = 450;
const ROW_LABEL_Y_GAP = 400;

class Schematics {
  constructor(layout) {
    this.layout = layout;
  }

  generate() {
    const components = this.generateComponents();
    return render('templates/matrix.ejs', { components });
  }

  generateComponents() {
    const prefix = randomHex(2);

    let x = X_INIT;
    let y = Y_INIT;
    let n = 0;
    let size = 1; // 1u
    let cn = 0;

    const componentsArr = [];
    this.layout.forEach((row, ri) => {
      row.forEach((k, ci) => {
        if (typeof k === 'object') {
          size = k.w || 1;
        } else {
          const genId = () => `${prefix}${randomHex(2)}`.toUpperCase();

          const name = getName(k);
          const key = Object.freeze({ name, x, y, size });
          const data = Object.freeze({ genId, key });

          componentsArr.push(render('templates/schematics/switch.ejs', data));
          componentsArr.push(render('templates/schematics/diode.ejs', data));

          // column connection
          const colConnection = { x: x + 300, y };
          componentsArr.push(render('templates/schematics/connection.ejs', colConnection));

          // diode line to row line
          const diodeLine = { x0: x - 350, y0: y + COL_LABEL_Y_GAP - 50, x1: x - 350, y1: y + COL_LABEL_Y_GAP }
          componentsArr.push(render('templates/schematics/line.ejs', diodeLine));

          // diode connection
          const diodeConnection = { x: x - COL_LABEL_X_GAP - X_INCR + 200, y: y + COL_LABEL_Y_GAP };
          componentsArr.push(render('templates/schematics/connection.ejs', diodeConnection));

          if (cn == 0) {
            const rowLabel = { x: x - COL_LABEL_X_GAP, y: y + COL_LABEL_Y_GAP, text: `row${ri}` };
            componentsArr.push(render('templates/schematics/label.ejs', rowLabel));

            // row connection to row label
            const rowLine = { x0: x - COL_LABEL_X_GAP, y0: y + COL_LABEL_Y_GAP, x1: x - 350, y1: y + COL_LABEL_Y_GAP }
            componentsArr.push(render('templates/schematics/line.ejs', rowLine));
          } else {
            // row connection to previous one
            const rowLine = { x0: x - COL_LABEL_X_GAP + 200, y0: y + COL_LABEL_Y_GAP, x1: x - COL_LABEL_X_GAP - X_INCR + 200, y1: y + COL_LABEL_Y_GAP };
            componentsArr.push(render('templates/schematics/line.ejs', rowLine));
          }

          if (ri === 0) {
            // column label
            const colLabel = { x: x + 300, y: y - ROW_LABEL_Y_GAP, text: `col${cn}` };
            componentsArr.push(render('templates/schematics/label.ejs', colLabel));

            // column connection to column label
            const colLine = { x0: x + 300, y0: y - ROW_LABEL_Y_GAP, x1: x + 300, y1: y }
            componentsArr.push(render('templates/schematics/line.ejs', colLine));
          } else {
            if (this.layout[ri - 1].length >= ci) {
              // column connection to previous line
              const colLine = { x0: x + 300, y0: y - Y_INCR, x1: x + 300, y1: y }
              componentsArr.push(render('templates/schematics/line.ejs', colLine));
            }
          }

          x += X_INCR;
          cn++;
          n++;
          size = 1;
        }
      });

      y += Y_INCR;
      x = X_INIT;
      cn = 0;
    });

    return componentsArr.join('');
  }
}

module.exports = (file) => new Schematics(file).generate();
