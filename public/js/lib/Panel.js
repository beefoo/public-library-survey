export default class Panel {
  constructor(options = {}) {
    const defaults = {};
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    this.tabButtons = document.querySelectorAll('.tab-button');
    this.tabs = document.querySelectorAll('.panel-tab');
    this.loadListeners();
  }

  loadListeners() {
    this.tabButtons.forEach((button) => {
      button.onclick = (event) => this.onClickTab(event);
    });
  }

  onClickTab(event) {
    const currentButton = event.currentTarget;
    const tabId = currentButton.getAttribute('data-tab');
    const tab = document.getElementById(tabId);
    this.tabButtons.forEach((button) => {
      if (button.id === currentButton.id) button.classList.add('active');
      else button.classList.remove('active');
    });
    this.tabs.forEach((tab) => {
      if (tab.id === tabId) tab.classList.add('active');
      else tab.classList.remove('active');
    });
  }
}
