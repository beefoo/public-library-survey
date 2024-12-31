import * as L from '../vendor/leaflet.js';
import Config from './Config.js';
import Gradient from './Gradient.js';
import Helper from './Helper.js';

export default class Map {
  constructor(options = {}) {
    this.init(options);
  }

  static defaults() {
    return {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      colorBy: 'pop_lsa',
      el: 'map',
      lat: 38.5767,
      lon: -92.1736, // Jefferson City, MO as center
      markerOpacity: [0.5, 0.9],
      markerRadius: [3, 30],
      minZoom: 4,
      maxZoom: 18,
      onChangeState: () => {},
      select: -1,
      strokeColor: '#00db42',
      tileUrlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      zoom: 4,
    };
  }

  init(options) {
    this.options = Object.assign(this.constructor.defaults(), options);
    this.colorOptions = [];
    this.data = [];
    this.markers = [];
    this.selectedMarkerIndex = parseInt(this.options.select);
    this.activeMarkerIndex = this.selectedMarkerIndex;
    this.colorBy = this.options.colorBy;
    this.gradient = new Gradient();
    this.$meta = document.getElementById('meta');
    this.$metaTitle = document.getElementById('meta-title');
    this.$metaDetails = document.getElementById('meta-details');
    this.$metaSimilar = document.getElementById('meta-similar');
    this.loadMap();
  }

  deselectMarker() {
    this.$meta.classList.remove('selected');
    if (this.selectedMarkerIndex >= 0)
      this.markers[this.selectedMarkerIndex].el.setStyle({ stroke: false });
    this.selectedMarkerIndex = -1;
  }

  filter(indices) {
    const { opacity } = this.getMarkerProperties();
    this.markers.forEach((marker, i) => {
      const isVisible = indices.includes(i);
      this.markers[i].visible = isVisible;
      if (isVisible) marker.el.setStyle({ fillOpacity: opacity });
      else marker.el.setStyle({ fillOpacity: 0 });
    });
  }

  getCurrentColorOption() {
    return document.querySelector('input[name="color-by"]:checked').value;
  }

  getMarkerProperties() {
    const { minZoom, maxZoom, markerOpacity, markerRadius } = this.options;
    const zoom = this.map.getZoom();
    const nzoom = Helper.norm(zoom, minZoom, maxZoom);
    const opacity = Helper.lerp(markerOpacity[0], markerOpacity[1], nzoom);
    const radius = Helper.lerp(markerRadius[0], markerRadius[1], nzoom);
    return { opacity, radius };
  }

  getState() {
    const latlon = this.map.getCenter();
    return {
      colorBy: this.colorBy,
      lat: latlon.lat,
      lon: latlon.lng,
      select: this.selectedMarkerIndex,
      zoom: this.map.getZoom(),
    };
  }

  jumpToMarker(markerIndex) {
    const item = this.data[markerIndex];
    const zoom = Math.max(this.map.getZoom(), 10);
    this.map.flyTo([item.lat, item.lon], zoom);
  }

  loadColorOptions(options) {
    // pre-compute colors
    const { colorBy, gradient, data } = this;
    options.forEach((opt) => {
      if (opt.type === 'quant') {
        const values = data.map((item) => {
          let value = item[opt.field];
          if ('maxValue' in opt) value = Math.min(opt.maxValue, value);
          if ('pow' in opt)
            value = value >= 0 ? Math.pow(value, opt.pow) : value;
          return value;
        });
        const maxValue = Helper.maxList(values);
        const minValue = Helper.minList(values);
        this.markers.forEach((_marker, index) => {
          const value = values[index];
          if ('minValue' in opt && value < opt.minValue) {
            this.markers[index].colors[opt.field] = '#ffffff';
          } else {
            this.markers[index].colors[opt.field] = gradient.colorFromQuant(
              value,
              minValue,
              maxValue,
              true,
            );
          }
        });
      } else {
        const values = opt.values.map((v) => v.value);
        this.markers.forEach((_marker, index) => {
          const value = data[index][opt.field];
          this.markers[index].colors[opt.field] = gradient.colorFromQual(
            value,
            values,
          );
        });
      }
    });
    // render options
    const parent = document.getElementById('tab-colors');
    let html = '';
    options.forEach((opt, i) => {
      const checked = opt.field === colorBy ? ' checked' : '';
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
    this.map.on('moveend', (event) => this.onMove(event));
    this.colorInputs.forEach((input) => {
      input.onchange = (event) => this.onColorChange(event);
    });
    document.getElementById('close-details').onclick = (event) => {
      this.toggleMeta();
    };
    this.$metaSimilar.onclick = (event) => {
      const $target = event.target.closest('.item-link');
      if ($target) this.onClickItem($target);
    };
  }

  loadMap() {
    const { options } = this;
    const map = L.map(options.el).setView(
      [parseFloat(options.lat), parseFloat(options.lon)],
      parseInt(options.zoom),
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
    const { opacity, radius } = this.getMarkerProperties();
    const markerGroup = new L.LayerGroup();
    this.markers = data.map((item, index) => {
      const marker = L.circleMarker([item.lat, item.lon], {
        fillOpacity: opacity,
        radius,
        stroke: false,
        color: options.strokeColor,
      });
      marker.on('mouseover', (_event) => this.onMarkerOver(index));
      marker.on('click', (_event) => this.onMarkerClick(index));
      marker.addTo(markerGroup);
      return {
        colors: {},
        visible: true,
        el: marker,
      };
    });
    markerGroup.addTo(this.map);
    if (this.selectedMarkerIndex >= 0)
      this.selectMarker(this.selectedMarkerIndex);
  }

  onClickItem($button) {
    const index = parseInt($button.getAttribute('data-index'), 10);
    this.selectMarker(index);
    this.jumpToMarker(index);
  }

  onColorChange(event) {
    const input = event.currentTarget;
    const { value } = input;
    this.updateColors(value);
  }

  onMarkerClick(markerIndex) {
    this.selectMarker(markerIndex);
    this.options.onChangeState();
  }

  onMarkerOver(markerIndex) {
    const { $meta, $metaTitle } = this;
    if ($meta.classList.contains('selected')) return;
    const item = this.data[markerIndex];
    this.activeMarkerIndex = markerIndex;
    $metaTitle.innerHTML = `${item.name} <small>(${item.city}, ${item.state})</small>`;
    $meta.classList.add('active');
  }

  onMove(_event) {
    this.options.onChangeState();
  }

  onZoom(_event) {
    const { opacity, radius } = this.getMarkerProperties();
    this.markers.forEach((marker) => {
      marker.el.setRadius(radius);
      if (marker.visible) marker.el.setStyle({ fillOpacity: opacity });
      else marker.el.setStyle({ fillOpacity: 0 });
    });
    this.options.onChangeState();
  }

  renderDetails(item) {
    const localeTypeFilter = Helper.where(
      Config.filterBy,
      'field',
      'locale_type',
    );
    const localeType = Helper.where(
      localeTypeFilter.values,
      'value',
      item.locale_type,
    );
    let html = '';
    html += '<dl>';
    html += `  <dt>Address</dt><dd><a href="${item.geo_url}" target="_blank">${item.address}, ${item.city}, ${item.state}</a></dd>`;
    html += `  <dt>Service area population</dt><dd>${item.pop_lsa.toLocaleString()}</dd>`;
    html += `  <dt>Locale type</dt><dd>${localeType.label}</dd>`;
    html += `  <dt>Median household income (Census)</dt><dd>$${item.income.toLocaleString()} (${item.income_score.toLocaleString()})</dd>`;
    html += `  <dt>Percent POC (Census)</dt><dd>${item.perc_poc}% (${item.perc_poc_score}%)</dd>`;
    html += `  <dt>Percent Hispanic (Census)</dt><dd>${item.perc_hispanic}% (${item.perc_hispanic_score}%)</dd>`;
    html += `  <dt>Staff</dt><dd>${item.staff.toLocaleString()} (${item.librarians.toLocaleString()} librarians)</dd>`;
    html += `  <dt>Revenue (operating)</dt><dd>$${item.op_revenue.toLocaleString()} / $${item.op_revenue_per_capita.toLocaleString()} (${item.op_revenue_per_capita_score}) per capita</dd>`;
    html += `  <dt>Revenue (capital)</dt><dd>$${item.cap_revenue.toLocaleString()}</dd>`;
    html += '</dl>';
    html += '<dl>';
    html += `  <dt>Items</dt><dd>${item.tot_phys_items.toLocaleString()} physical / ${item.tot_e_items.toLocaleString()} electronic</dd>`;
    html += `  <dt>Visits</dt><dd>${item.visits.toLocaleString()} / ${item.visits_per_capita.toLocaleString()} (${item.visits_per_capita_score}) per capita</dd>`;
    html += `  <dt>Total programs</dt><dd>${item.programs.toLocaleString()} / ${item.programs_per_capita.toLocaleString()} (${item.programs_per_capita_score}) per capita</dd>`;
    html += `  <dt>Percent programs on-site</dt><dd>${item.perc_onsite_programs.toFixed(2)}%</dd>`;
    html += `  <dt>Total program attendence</dt><dd>${item.program_attendance.toLocaleString()} / ${item.attendance_per_program.toLocaleString()} (${item.attendance_per_program_score}) per program</dd>`;
    html += `  <dt>On-site program attendance</dt><dd>${item.onsite_program_attendance.toLocaleString()} / ${item.onsite_attendance_per_program.toFixed(2)} per program (${item.onsite_attendance_per_program_score})</dd>`;
    html += `  <dt>Computer sessions</dt><dd>${item.computer_sessions.toLocaleString()} / ${item.computer_per_capita.toLocaleString()} (${item.computer_per_capita_score}) per capita</dd>`;
    html += `  <dt>Wireless sessions</dt><dd>${item.wireless_sessions.toLocaleString()} / ${item.wifi_per_capita.toLocaleString()} (${item.wifi_per_capita_score}) per capita</dd>`;
    html += '</dl>';
    this.$metaDetails.innerHTML = html;
  }

  renderSimilar(item) {
    if (!('similar' in item) || !item.similar) return;
    const { data } = this;
    const rows = [item].concat(item.similar.map((index) => data[index]));
    let html = '<table>';
    html +=
      '<tr><th>&nbsp;</th><th>Name</th><th>Location</th><th>Budget</th><th>Income</th><th>POC</th></tr>';
    rows.forEach((row, i) => {
      html += '<tr>';
      html += `<td>${i}.</td>`;
      html += `<td><button class="item-link" data-index="${row.originalIndex}">${row.name}</button></td>`;
      html += `<td>${row.city}, ${row.state}</td>`;
      html += `<td>$${row.op_revenue.toLocaleString()}</td>`;
      html += `<td>$${row.income.toLocaleString()}</td>`;
      html += `<td>${row.perc_poc}%</td>`;
      html += '</tr>';
    });
    html += '</table>';
    this.$metaSimilar.innerHTML = html;
  }

  selectMarker(markerIndex) {
    const { $meta, $metaTitle } = this;
    if (
      $meta.classList.contains('selected') &&
      markerIndex === this.selectedMarkerIndex
    ) {
      this.deselectMarker();
      return;
    }
    if (this.selectedMarkerIndex >= 0)
      this.markers[this.selectedMarkerIndex].el.setStyle({ stroke: false });
    this.markers[markerIndex].el.setStyle({ stroke: true }).bringToFront();
    this.selectedMarkerIndex = markerIndex;
    this.activeMarkerIndex = markerIndex;
    const item = this.data[markerIndex];
    $metaTitle.innerHTML = `${item.name} <small>(${item.city}, ${item.state})</small>`;
    this.renderDetails(item);
    this.renderSimilar(item);
    $meta.classList.add('active', 'selected');
  }

  setData(data) {
    this.data = data;
  }

  toggleMeta() {
    const selected = this.$meta.classList.contains('selected');
    if (selected) this.deselectMarker();
    else this.selectMarker(this.activeMarkerIndex);
  }

  updateColors(colorOptionKey) {
    const label = document.getElementById('quant-key-label');
    const colorOption = Helper.where(
      this.colorOptions,
      'field',
      colorOptionKey,
    );
    if (colorOption) label.innerHTML = colorOption.label;
    this.markers.forEach((marker) => {
      const color = marker.colors[colorOptionKey];
      marker.el.setStyle({ fillColor: color });
    });
    this.colorBy = colorOptionKey;
    this.options.onChangeState();
  }
}
