import itemsjs from '../vendor/itemsjs.js';
import Helper from './Helper.js';

export default class Data {
  constructor(options = {}) {
    const defaults = {
      maxResults: 1000,
      src: 'data/2022-library-data.json',
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    this.data = [];
    this.$results = document.getElementById('tab-results');
  }

  async load() {
    const { options } = this;
    const response = await fetch(options.src);
    const table = await response.json();
    const rows = this.constructor.parseTable(table);
    this.items = this.constructor.parseItems(rows);
    this.results = this.items.slice();
    this.renderResults();
  }

  static parseItems(rows) {
    return rows.map((row, i) => {
      const item = structuredClone(row);
      item.originalIndex = i;
      return item;
    });
  }

  static parseTable(table) {
    const { rows, cols } = table;
    return rows.map((row) => {
      const item = {};
      cols.forEach((col, i) => {
        item[col] = row[i];
      });
      return item;
    });
  }

  renderResults() {
    const { maxResults } = this.options;
    let { results, $results } = this;
    const count = results.length;
    const population = Helper.sum(results, 'pop_lsa');
    if (count > maxResults) results = results.slice(0, maxResults);
    let html = '';
    html += `<p>Found <strong>${count.toLocaleString()}</strong> libraries serving <strong>${population.toLocaleString()}</strong> people.</p>`;
    html += '<ul class="result-list">';
    results.forEach((item, i) => {
      html += `<li><button data-index="${item.originalIndex}" class="result-button">${i + 1}. ${item.name} <small>(${item.city}, ${item.state})</small></button></li>`;
    });
    html += '</ul>';
    $results.innerHTML = html;
  }
}
