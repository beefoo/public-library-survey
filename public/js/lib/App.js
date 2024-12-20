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
    this.data = new Data({
      onClickResult: (index) => {
        this.map.onMarkerClick(index);
        this.map.jumpToMarker(index);
      },
      onFilter: () => {
        const indices = this.data.results.map((result) => result.originalIndex);
        this.map.filter(indices);
      },
    });
    this.panel = new Panel();
    await this.data.load();
    this.data.renderFacets();
    this.map.setData(this.data.items);
    this.map.loadMarkers();
    this.map.loadColorOptions(Config.colorBy);
    const colorOption = this.map.getCurrentColorOption();
    this.map.updateColors(colorOption);
    this.map.loadListeners();
    this.data.loadListeners();
  }
}
