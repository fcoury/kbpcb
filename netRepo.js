
class NetRepo {
  constructor() {
    this.nets = new Set();
    this.add('');
  }

  get array() {
    return [...this.nets];
  }

  clear() {
    this.nets.clear();
    this.add('');
  }

  format(net) {
    return `(net ${this.indexOf(net)} "${net}")`;
  }

  get(name) {
    return this.format(this.array[this.indexOf(name)]);
  }

  indexOf(net) {
    return this.array.indexOf(net);
  }

  add(net) {
    this.nets.add(net);
    return this.format(net);
  }
}

// create a unique, global symbol name
// -----------------------------------

const NET_REPO = Symbol.for("MrKeebs.KbPCB.NetRepo");

// check if the global object has this symbol
// add it if it does not have the symbol, yet
// ------------------------------------------

var globalSymbols = Object.getOwnPropertySymbols(global);
var exists = (globalSymbols.indexOf(NET_REPO) > -1);

if (!exists) {
  global.NET_REPO = new NetRepo();
}

// define the singleton API
// ------------------------

var singleton = {};

Object.defineProperty(singleton, "instance", {
  get: function(){
    return global.NET_REPO;
  }
});

console.log('singleton', singleton);


// ensure the API is never changed
// -------------------------------

Object.freeze(singleton);

// export the singleton API only
// -----------------------------

module.exports = singleton;
