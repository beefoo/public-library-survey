import * as L from '../vendor/leaflet.js';
import Helper from './Helper.js';

export default class Map {
  constructor(options = {}) {
    const defaults = {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      centerLatLon: [38.5767, -92.1736], // Jefferson City, MO as center
      el: 'map',
      markerOpacity: [0.5, 0.9],
      markerRadius: [3, 30],
      minZoom: 4,
      maxZoom: 18,
      startZoom: 4, // see the whole country
      tileUrlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    this.colorOptions = [];
    this.data = [];
    this.loadMap();
  }

  loadColorOptions(options) {
    const parent = document.getElementById('tab-colors');
    let html = '';
    options.forEach((opt, i) => {
      const checked = i === 0 ? ' checked' : '';
      html += `<label class="radio-label" for="color-${opt.field}">`;
      html += `  <input type="radio" id="color-${opt.field}" name="color-by" value="${opt.field}" ${checked} />`;
      html += `  ${opt.label}`;
      html += '</label>';
    });
    parent.innerHTML = html;
    this.colorOptions = options;
    this.colorInputs = document.querySelectorAll('input[name="color-by"]');
  }

  loadListeners() {
    this.map.on('zoomend', (event) => this.onZoom(event));
    this.colorInputs.forEach((input) => {
      input.onchange = (event) => this.onColorChange(event);
    });
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
    this.map = map;
  }

  loadMarkers() {
    const { data, options } = this;
    const markerGroup = new L.LayerGroup();
    this.markers = data.map((item) => {
      const marker = L.circleMarker([item.lat, item.lon], {
        fillOpacity: options.markerOpacity[0],
        radius: options.markerRadius[0],
        stroke: false,
      }).addTo(markerGroup);
      return {
        id: item.id,
        el: marker,
      };
    });
    markerGroup.addTo(this.map);
  }

  onColorChange(event) {
    const input = event.currentTarget;
    const { value } = input;
    console.log(value);
  }

  onZoom(_event) {
    const { minZoom, maxZoom, markerOpacity, markerRadius } = this.options;
    const zoom = this.map.getZoom();
    const nzoom = Helper.norm(zoom, minZoom, maxZoom);
    const opacity = Helper.lerp(markerOpacity[0], markerOpacity[1], nzoom);
    const radius = Helper.lerp(markerRadius[0], markerRadius[1], nzoom);
    this.markers.forEach((marker, i) => {
      marker.el.setRadius(radius);
      marker.el.setStyle({ fillOpacity: opacity });
    });
  }

  setData(data) {
    this.data = data;
  }
}
