import Map from './Map.js';

export default class App {
  constructor(options = {}) {
    const defaults = {};
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    this.map = new Map();
  }
}
