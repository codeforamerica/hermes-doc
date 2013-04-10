var TEXT_MESSAGE_OVERFLOW = 160;

function main() {
  var els = document.querySelectorAll('.phone > span');

  for (var i = 0, el; el = els[i]; i++) {
    var count = el.innerText.length;

    var countEl = document.createElement('span');
    countEl.classList.add('count');
    countEl.innerHTML = count;

    if (count > TEXT_MESSAGE_OVERFLOW) {
      countEl.classList.add('overflow');
    }

    el.appendChild(countEl);
  }
}

document.addEventListener('DOMContentLoaded', main, false);