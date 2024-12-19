import * as L from '../vendor/leaflet.js';

export default class Map {
  constructor(options = {}) {
    const defaults = {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      centerLatLon: [38.5767, -92.1736], // Jefferson City, MO as center
      el: 'map',
      minZoom: 3,
      maxZoom: 18,
      startZoom: 4, // see the whole country
      tileUrlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    this.loadMap();
  }

  loadMap() {
    const { options } = this;
    const map = L.map(options.el).setView(
      options.centerLatLon,
      options.startZoom,
    );
    L.tileLayer(options.tileUrlTemplate, {
      minZoom: options.minZoom,
      maxZoom: options.maxZoom,
      attribution: options.attribution,
    }).addTo(map);
  }
}
