import Data from './Data.js';
import Map from './Map.js';

export default class App {
  constructor(options = {}) {
    const defaults = {};
    this.options = Object.assign(defaults, options);
    this.init();
  }

  async init() {
    this.map = new Map();
    this.data = new Data();
    await this.data.load();
    this.map.loadMarkers(this.data.items);
  }
}
