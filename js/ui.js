/* Kleine UI-helpers, gedeeld door de mini-games. */
(function () {
  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props) {
      for (const k in props) {
        if (k === "class") node.className = props[k];
        else if (k === "html") node.innerHTML = props[k];
        else if (k.startsWith("on") && typeof props[k] === "function") {
          node.addEventListener(k.slice(2).toLowerCase(), props[k]);
        } else if (k === "dataset") {
          for (const d in props[k]) node.dataset[d] = props[k][d];
        } else node.setAttribute(k, props[k]);
      }
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function sample(arr, n) {
    return shuffle(arr).slice(0, n);
  }

  // n willekeurige spelers behalve `exclude`.
  function distractors(all, exclude, n, keyFn) {
    const key = keyFn || function (p) { return p.id; };
    const pool = all.filter(function (p) { return key(p) !== key(exclude); });
    return sample(pool, n);
  }

  window.UI = { el: el, shuffle: shuffle, sample: sample, distractors: distractors };
})();
