var currentUrl = '';

function updateHash() {
  window.history.replaceState(null, '', '#' + currentUrl);
}

function onTabClickEl(el) {
  if (currentUrl) {
    document.querySelector('#content > div[href="' + currentUrl + '"]').
        classList.remove('selected');
    document.querySelector('nav > a[href="' + currentUrl + '"]').
        classList.remove('selected');
  }
  
  currentUrl = el.getAttribute('href');

  document.querySelector('#content > div[href="' + currentUrl + '"]').
      classList.add('selected');
  document.querySelector('nav > a[href="' + currentUrl + '"]').
      classList.add('selected');

  updateHash();
}

function onTabClick(event) {
  var el = event.target;

  if (!event.ctrlKey && !event.altKey && !event.metaKey) {
    onTabClickEl(el);
      
    event.preventDefault();
  }
}

function createNav() {
  var titleEl = document.createElement('h1');
  titleEl.innerHTML = MOCKS.title;
  document.querySelector('nav').appendChild(titleEl);

  document.title = MOCKS.title;

  for (var i in MOCKS.categories) {
    var category = MOCKS.categories[i];

    var titleEl = document.createElement('h2');
    titleEl.innerHTML = category.title;
    document.querySelector('nav').appendChild(titleEl);

    for (var j in category.mocks) {
      if (category.mocks[j].subcategory) {
        var titleEl = document.createElement('h3');
        titleEl.innerHTML = category.mocks[j].subcategory;
        document.querySelector('nav').appendChild(titleEl);
      } else {
        var mockEl = document.createElement('a');
        mockEl.href = category.mocks[j].url;
        mockEl.innerHTML = category.mocks[j].title;
        document.querySelector('nav').appendChild(mockEl);
      }
    }
  }
}

function createMocks() {
  var els = document.querySelectorAll('nav > a');
  for (var i = 0, el; el = els[i]; i++) {
    var url = el.getAttribute('href');

    var parentEl = document.createElement('div');
    parentEl.setAttribute('href', url);

    if (url.substr(url.length - 5, 5) == '.html') {
      var mockEl = document.createElement('iframe');
    } else {
      var mockEl = document.createElement('img');
    }
    mockEl.src = url;

    parentEl.appendChild(mockEl);

    document.querySelector('#content').appendChild(parentEl);
  }
}

function addEventListeners() {
  var els = document.querySelectorAll('nav > a');
  for (var i = 0, el; el = els[i]; i++) {
    el.addEventListener('click', onTabClick, false);
  }

  window.addEventListener('popstate', onPopState, false);
}

function determineStartingMock() {
  var url = location.hash.substr(1);

  var el = document.querySelector('nav > a[href="' + url + '"]');

  if (el) {
    onTabClickEl(el); 
  } else {
    onTabClickEl(document.querySelector('nav > a')); 
  }
}

function onPopState(event) {
  var url = location.hash.substr(1);

  var el = document.querySelector('nav > a[href="' + url + '"]');

  if (el) {
    onTabClickEl(el); 
  }
}

function main() {
  createNav();
  createMocks();
  addEventListeners();
  determineStartingMock();
}
