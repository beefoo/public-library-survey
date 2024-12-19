import Config from './Config.js';
import Data from './Data.js';
import Map from './Map.js';
import Panel from './Panel.js';

export default class App {
  constructor(options = {}) {
    const defaults = {};
    this.options = Object.assign(defaults, options);
    this.init();
  }

  async init() {
    this.map = new Map();
    this.data = new Data();
    this.panel = new Panel();
    await this.data.load();
    this.map.setData(this.data.items);
    this.map.loadColorOptions(Config.colorBy);
    this.map.loadMarkers();
    this.map.loadListeners();
  }
}
