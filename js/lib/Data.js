import itemsjs from '../vendor/itemsjs.js';

export default class Data {
  constructor(options = {}) {
    const defaults = {
      src: 'data/2022-library-data.json',
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    this.data = [];
  }

  async load() {
    const { options } = this;
    const response = await fetch(options.src);
    const table = await response.json();
    const rows = this.constructor.parseTable(table);
    this.items = this.constructor.parseItems(rows);
  }

  static parseItems(rows) {
    return rows.map((row) => {
      const item = structuredClone(row);
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
}
