import Config from './Config.js';
import Helper from './Helper.js';

export default class Data {
  constructor(options = {}) {
    const defaults = {
      maxResults: 1000,
      onClickResult: (index) => {},
      onFilter: () => {},
      src: 'data/2022-library-data.json',
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    this.items = [];
    this.filters = {};
    this.$results = document.getElementById('tab-results');
    this.$filters = document.getElementById('tab-filters');
  }

  filterResults() {
    const $filters = document.querySelectorAll('.select-filter');
    const filters = {};
    $filters.forEach(($filter) => {
      let { value } = $filter;
      if (!value || value === 'all') return;
      if (/^\d+$/.test(value)) value = parseInt(value, 10);
      filters[$filter.getAttribute('data-field')] = value;
    });
    this.results = this.items.filter((row, i) => {
      let valid = true;
      for (const [field, value] of Object.entries(filters)) {
        if (!(field in row && row[field] === value)) valid = false;
      }
      return valid;
    });
    this.filters = filters;
    this.renderResults();
    this.renderFacets();
    this.options.onFilter();
  }

  async load() {
    const { options } = this;
    const response = await fetch(options.src);
    const table = await response.json();
    const rows = this.constructor.parseTable(table);
    this.items = this.constructor.parseItems(rows);
    this.results = this.items.slice();
    this.totalPopulation = Helper.sum(this.items, 'pop_lsa');
    this.renderResults();
  }

  loadFilterListeners() {
    const filterSelects = document.querySelectorAll('.select-filter');
    filterSelects.forEach(($select) => {
      $select.onchange = (_event) => this.filterResults();
    });
  }

  loadListeners() {
    this.$results.onclick = (event) => {
      const $target = event.target.closest('.result-button');
      if ($target) this.onClickResult($target);
    };
  }

  onClickResult($button) {
    const index = parseInt($button.getAttribute('data-index'), 10);
    this.options.onClickResult(index);
  }

  static parseItems(rows) {
    const { filterBy } = Config;
    // calculate value ranges for percent ranges
    const ranges = {};
    filterBy.forEach((filter) => {
      const { type, field } = filter;
      if (type === 'perc_range') {
        const values = rows.map((row) => (field in row ? row[field] : -1));
        const minValue = Helper.minList(values);
        const maxValue = Helper.maxList(values);
        ranges[field] = [minValue, maxValue];
      }
    });
    return rows.map((row, i) => {
      const item = structuredClone(row);
      item.originalIndex = i;
      // add new fields for filters that are ranges
      filterBy.forEach((filter) => {
        const { field, type, values, label } = filter;
        let itemValue = field in row ? row[field] : -1;
        if (type === 'perc_range') {
          const [minValue, maxValue] = ranges[field];
          itemValue = Helper.norm(itemValue, minValue, maxValue) * 100;
        }
        if (type === 'range' || type === 'perc_range') {
          let found = false;
          values.forEach((v) => {
            if (found) return;
            if (
              'minValue' in v &&
              'maxValue' in v &&
              itemValue >= v.minValue &&
              itemValue < v.maxValue
            ) {
              item[`filter-${field}`] = v.label;
              found = true;
              return;
            } else if (
              'minValue' in v &&
              !('maxValue' in v) &&
              itemValue >= v.minValue
            ) {
              item[`filter-${field}`] = v.label;
              found = true;
              return;
            } else if (
              'maxValue' in v &&
              !('minValue' in v) &&
              itemValue < v.maxValue
            ) {
              item[`filter-${field}`] = v.label;
              found = true;
              return;
            }
          });
        }
      });
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

  renderFacets() {
    const { filters, results } = this;
    const { filterBy } = Config;
    const { $filters } = this;
    const filtersWithCounts = filterBy.slice();

    // initialize counts
    filtersWithCounts.forEach((filter, i) => {
      filter.values.forEach((v, j) => {
        filtersWithCounts[i].values[j].count = 0;
      });
    });

    // calculate counts from results
    results.forEach((result) => {
      filtersWithCounts.forEach((filter, i) => {
        const { values, field, type } = filter;
        const itemField = type === 'value' ? field : `filter-${field}`;
        const itemValue = itemField in result ? result[itemField] : false;
        let found = false;
        values.forEach((v, j) => {
          if (found) return;
          const value = type === 'value' ? v.value : v.label;
          if (value === itemValue) {
            filtersWithCounts[i].values[j].count += 1;
            found = true;
            return;
          }
        });
      });
    });

    // render the results
    let html = '';
    filtersWithCounts.forEach((filter) => {
      const { label, field, type, values } = filter;
      const fieldName = type === 'value' ? field : `filter-${field}`;
      html += `<label for="filter-${field}">${label}</label>`;
      html += `<select id="filter-${field}" name="filter-${field}" data-field="${fieldName}" class="select-filter">`;
      html += '  <option value="all">All</option>';
      values.forEach((v) => {
        if (v.count < 1) return;
        const value = 'value' in v ? v.value : v.label;
        const selected =
          fieldName in filters && filters[fieldName] === value
            ? 'selected'
            : '';
        html += `  <option value="${value}" ${selected}>${v.label} (${v.count.toLocaleString()})</option>`;
      });
      html += '</select>';
    });
    $filters.innerHTML = html;

    this.loadFilterListeners();
  }

  renderResults() {
    const { maxResults } = this.options;
    let { results, $results, filters, totalPopulation } = this;
    const count = results.length;
    const population = Helper.sum(results, 'pop_lsa');
    const popPercent = (population / totalPopulation) * 100;
    if (count > maxResults) results = results.slice(0, maxResults);
    const popPecentString =
      popPercent < 100 ? ` (${popPercent.toFixed(2)}% of total served)` : '';
    let html = '';
    html += `<p>Found <strong>${count.toLocaleString()}</strong> libraries serving <strong>${population.toLocaleString()}${popPecentString}</strong> people`;
    if (Object.keys(filters).length > 0) {
      html += ' with filters: ';
      let filterStrings = [];
      for (const [field, value] of Object.entries(filters)) {
        const fieldLookup = field.replace('filter-', '');
        const filter = Helper.where(Config.filterBy, 'field', fieldLookup);
        let label = value;
        if (filter.type === 'value') {
          const v = Helper.where(filter.values, 'value', value);
          label = v.label;
        }
        filterStrings.push(
          `<span class="filter-label">${filter.label} = "${label}"</span>`,
        );
      }
      html += filterStrings.join(', ');
    }

    html += '.</p>';
    html += '<ul class="result-list">';
    results.forEach((item, i) => {
      html += `<li><button data-index="${item.originalIndex}" class="result-button">${i + 1}. ${item.name} <small>(${item.city}, ${item.state})</small></button></li>`;
    });
    html += '</ul>';
    $results.innerHTML = html;
    $results.scrollTop = 0;
  }
}
