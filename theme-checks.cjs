const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('dist/theme.js', 'utf8');
function boot({ saved = null, dark = false, blocked = false } = {}) {
  const system = { matches: dark, addEventListener(_, fn) { this.change = fn; } };
  const control = { value: '', addEventListener(_, fn) { this.change = fn; } };
  const meta = {};
  const events = [];
  const root = { dataset: {} };
  let ready;
  const context = {
    matchMedia: () => system,
    localStorage: {
      getItem() { if (blocked) throw Error('Unavailable'); return saved; },
      setItem(_, value) { if (blocked) throw Error('Unavailable'); saved = value; },
    },
    document: {
      documentElement: root,
      querySelector: selector => selector === '#theme' ? control : meta,
      addEventListener(_, fn) { ready = fn; },
    },
    Event: class { constructor(type) { this.type = type; } },
    window: { dispatchEvent(event) { events.push(event.type); } },
  };
  vm.runInNewContext(source, context);
  ready();
  return { root, system, control, meta, events, stored: () => saved };
}
let app = boot({ dark: true });
assert.equal(app.root.dataset.theme, 'dark');
assert.equal(app.meta.content, '#212529');
app.system.matches = false; app.system.change();
assert.equal(app.root.dataset.theme, 'light');
app.control.value = 'dark'; app.control.change();
assert.equal(app.stored(), 'dark');
assert.equal(app.root.dataset.theme, 'dark');
app.system.change();
assert.equal(app.root.dataset.theme, 'dark');
app.control.value = 'system'; app.control.change();
assert.equal(app.root.dataset.theme, 'light');
assert(app.events.every(event => event === 'orbit-theme-change'));
assert.equal(boot({ saved: 'light', dark: true }).root.dataset.theme, 'light');
assert.equal(boot({ saved: 'invalid', dark: true }).root.dataset.theme, 'dark');
assert.equal(boot({ blocked: true, dark: true }).root.dataset.theme, 'dark');
const css = fs.readFileSync('dist/style.css', 'utf8');
assert.match(css, /--plot-bg: #212529/);
assert.match(css, /--plot-bg: #f8f9fa/);
for (const file of ['index.html', 'dist/index.html']) {
  const html = fs.readFileSync(file, 'utf8');
  assert(html.indexOf('theme.js') < html.indexOf('style.css'));
  assert.match(html, /id="theme"/);
}
console.log('Theme checks passed: system changes, saved choice, blocked storage, invalid preference, first paint, and canvas palette');
