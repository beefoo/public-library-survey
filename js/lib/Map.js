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
    this.loadMap();
  }

  loadListeners() {
    this.map.on('zoomend', (event) => this.onZoom(event));
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

  loadMarkers(markers) {
    const { options } = this;
    const markerGroup = new L.LayerGroup();
    this.markers = markers.map((marker) => {
      const el = L.circleMarker([marker.lat, marker.lon], {
        fillOpacity: options.markerOpacity[0],
        radius: options.markerRadius[0],
        stroke: false,
      }).addTo(markerGroup);
      return {
        id: marker.id,
        el,
      };
    });
    markerGroup.addTo(this.map);
    this.loadListeners();
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
}
