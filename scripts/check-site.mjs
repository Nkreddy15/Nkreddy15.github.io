import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = root;
const html = fs.readFileSync(path.join(publicRoot, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(publicRoot, 'styles.css'), 'utf8');
const data = fs.readFileSync(path.join(publicRoot, 'site-data.js'), 'utf8');
const app = fs.readFileSync(path.join(publicRoot, 'app.js'), 'utf8');
const attrs = (tag) => Object.fromEntries(Array.from(tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs), (match) => [match[1], match[3]]));
const tags = Array.from(html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi), (match) => ({ tag: match[1].toLowerCase(), ...attrs(match[2]) }));
const ids = tags.filter((tag) => tag.id).map((tag) => tag.id);
assert.equal(ids.length, new Set(ids).size, 'HTML IDs must be unique');
assert.equal(tags.filter((tag) => tag.tag === 'h1').length, 1, 'Use one top-level heading');
assert.match(html, /<html lang="en"(?:\s[^>]*)?>/);
assert.match(html, /name="viewport"/);
assert.match(css, /prefers-reduced-motion/);
assert(!css.includes("@media print"), "No print fallback may reset the dark portfolio");
assert.match(html, /<body style="background:#000;color:#e9eef3;color-scheme:dark">/);
assert.match(css, /background-color:#000!important/);

for (const tag of tags) {
  for (const key of ['href', 'src']) {
    const value = tag[key];
    if (!value) continue;
    if (value.startsWith('#')) assert(ids.includes(value.slice(1)), `Missing internal target ${value}`);
    else if (value.startsWith('./')) assert(fs.existsSync(path.join(publicRoot, value)), `Missing asset ${value}`);
    else assert(/^(https:\/\/|mailto:|data:)/.test(value), `Unexpected URL scheme: ${value}`);
  }
  if (tag.target === '_blank') {
    assert(tag.rel?.includes('noopener') && tag.rel?.includes('noreferrer'), 'External tabs must include safe rel attributes');
  }
  if (tag.tag === 'button') assert.equal(tag.type, 'button', 'Buttons need an explicit type');
  if (tag['aria-controls']) assert(ids.includes(tag['aria-controls']), 'aria-controls target must exist');
}

const schemaMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
assert.equal(JSON.parse(schemaMatch[1])['@type'], 'Person');
const expectedRepos = ['ginkgo-admet-predictive-modeling', 'Employee-Attrition-Prediction-API', 'privacy-preserving-healthcare-readmission', 'differential-privacy-medical-ai', 'aws-medical-saas-cloud-architecture', 'signal-vault', 'frontdesk-pilot', 'My_model', 'assignment'];
for (const repo of expectedRepos) assert(tags.some((tag) => tag.href === `https://github.com/Nkreddy15/${repo}`), `Missing repository ${repo}`);

// Exercise the actual application scripts with a small isolated DOM adapter.
// This checks state transitions; it does not emulate browser layout or rendering.
class Element {
  constructor(attributes = {}) {
    this.attributes = { ...attributes };
    this.dataset = {};
    for (const [key, value] of Object.entries(attributes)) if (key.startsWith('data-')) this.dataset[key.slice(5)] = value;
    this.listeners = new Map();
    this.classes = new Set((attributes.class || '').split(' ').filter(Boolean));
    this.classList = {
      add: (...names) => names.forEach((name) => this.classes.add(name)),
      remove: (...names) => names.forEach((name) => this.classes.delete(name)),
      contains: (name) => this.classes.has(name),
      toggle: (name, force) => {
        const add = force ?? !this.classes.has(name);
        if (add) this.classes.add(name); else this.classes.delete(name);
        return add;
      }
    };
    this.style = { setProperty(name, value) { this[name] = value; } };
    this.hidden = false;
    this.textContent = '';
  }
  setAttribute(key, value) { this.attributes[key] = value; }
  get id() { return this.attributes.id; }
  getBoundingClientRect() { return { left: 0, top: 0, width: 600, height: 400, right: 600, bottom: 400 }; }
  getAttribute(key) { return this.attributes[key] ?? null; }
  removeAttribute(key) { delete this.attributes[key]; }
  addEventListener(name, listener) {
    const callbacks = this.listeners.get(name) || [];
    callbacks.push(listener);
    this.listeners.set(name, callbacks);
  }
  async fire(name, details = {}) {
    for (const callback of this.listeners.get(name) || []) await callback({ target: this, ...details });
  }
  focus() { document.activeElement = this; }
  select() { this.selected = true; }
  remove() { this.removed = true; }
}
const parsedElements = tags.map((tag) => new Element(tag));
const byId = (id) => parsedElements.find((element) => element.attributes.id === id);
const byClass = (name) => parsedElements.filter((element) => element.classes.has(name));
const nav = byId('main-nav');
const navTags = Array.from(html.match(/<nav\b[\s\S]*?<\/nav>/)[0].matchAll(/<a\b([^>]*)>/g), (match) => new Element(attrs(match[1])));
nav.querySelectorAll = (selector) => selector === 'a' ? navTags : navTags.filter((element) => element.attributes.href.startsWith('#'));
const closeButton = byClass('dialog-close')[0];
const dialog = byId('project-dialog');
dialog.querySelector = () => closeButton;
dialog.getBoundingClientRect = () => ({ left: 100, right: 700, top: 80, bottom: 650 });
dialog.showModal = () => { dialog.open = true; };
dialog.close = () => { dialog.open = false; void dialog.fire('close'); };
const body = new Element();
body.appendChild = (element) => { body.appended = element; };
const document = new Element();
document.body = body;
document.documentElement = { scrollHeight: 3000 };
document.querySelector = (selector) => selector.startsWith('#') ? byId(selector.slice(1)) : byClass(selector.slice(1))[0];
document.querySelectorAll = (selector) => {
  if (selector === '.project-card[data-category]') return byClass('project-card');
  if (selector === '.filter') return byClass('filter');
  if (selector === '[data-project]') return parsedElements.filter((element) => element.dataset.project);
  if (selector === '#work, #about, #research, #contact') return ['work', 'about', 'research', 'contact'].map(byId);
  if (selector === '.project-card, .lab-card') return [...byClass('project-card'), ...byClass('lab-card')];
  if (selector === '.reveal') return byClass('reveal');
  if (selector.startsWith('.section-heading,')) return [...byClass('section-heading'), ...byClass('project-card'), ...byClass('research-paper'), ...byClass('about-title-column'), ...byClass('about-content'), ...byClass('lab-card'), ...byClass('beyond-section'), ...byClass('contact-section')];
  throw new Error(`Unimplemented test selector ${selector}`);
};
document.createElement = () => new Element();
document.createRange = () => ({ selectNodeContents: () => {} });
document.execCommand = () => true;
const window = new Element();
window.innerWidth = 390;
window.innerHeight = 800;
window.scrollY = 0;
window.isSecureContext = true;
window.requestAnimationFrame = (callback) => callback();
window.getSelection = () => ({ removeAllRanges: () => {}, addRange: () => {} });
window.open = (url) => { window.openedURL = url; };
const motionPreference = new Element();
motionPreference.matches = false;
window.matchMedia = (query) => query.includes('prefers-reduced-motion') ? motionPreference : { matches: true };
class MockIntersectionObserver {
  constructor(callback) { this.callback = callback; }
  observe(target) { this.callback([{ target, isIntersecting: true }]); }
  unobserve() {}
}
window.IntersectionObserver = MockIntersectionObserver;
const copied = [];
const navigator = { clipboard: { writeText: async (value) => copied.push(value) } };
const context = vm.createContext({ document, window, navigator, console, Date, IntersectionObserver: MockIntersectionObserver });
vm.runInContext(data, context, { filename: 'site-data.js' });
vm.runInContext(app, context, { filename: 'app.js' });

const filters = byClass('filter');
const expectedCounts = { all: 5, ml: 4, responsible: 2, cloud: 1 };
for (const filter of filters) {
  await filter.fire('click');
  assert.equal(byClass('project-card').filter((card) => !card.hidden).length, expectedCounts[filter.dataset.filter]);
  assert.equal(filters.filter((item) => item.getAttribute('aria-pressed') === 'true').length, 1);
  assert.match(byId('project-count').textContent, new RegExp(`^${expectedCounts[filter.dataset.filter]} PUBLIC PROJECT`));
}
await filters[0].fire('click');

const menu = byClass('menu-toggle')[0];
await menu.fire('click');
assert.equal(menu.getAttribute('aria-expanded'), 'true');
assert(nav.classList.contains('menu-open'));
await navTags[0].fire('click');
assert.equal(menu.getAttribute('aria-expanded'), 'false');
await menu.fire('click');
await document.fire('keydown', { key: 'Escape' });
assert.equal(menu.getAttribute('aria-expanded'), 'false');
assert.equal(document.activeElement, menu);
await menu.fire('click');
window.innerWidth = 1000;
await window.fire('resize');
assert.equal(menu.getAttribute('aria-expanded'), 'false');

const projectTriggers = parsedElements.filter((element) => element.dataset.project);
assert.equal(projectTriggers.length, 7);
for (const trigger of projectTriggers) {
  await trigger.fire('click');
  assert(dialog.open);
  assert(body.classList.contains('modal-open'));
  const content = byId('dialog-content').innerHTML;
  assert(content.includes('id="dialog-title"'));
  assert(content.includes('https://github.com/Nkreddy15/'));
  assert(!content.includes('undefined'));
  if (['signal', 'frontdesk'].includes(trigger.dataset.project)) assert(content.includes('Private repository.'));
  if (trigger.dataset.project === 'ginkgo') for (const metric of ['0.164', '−0.055', '0.342', 'random split']) assert(content.includes(metric));
  await closeButton.fire('click');
  assert(!dialog.open);
  assert(!body.classList.contains('modal-open'));
  assert.equal(document.activeElement, trigger);
}
await projectTriggers[0].fire('click');
await dialog.fire('click', { clientX: 20, clientY: 20 });
assert(!dialog.open, 'Outside backdrop click closes details');
await byId('copy-email').fire('click');
assert.equal(copied[0], 'nikhilkumarreddyc.15.11.2002@gmail.com');
assert.equal(byId('copy-status').textContent, 'EMAIL ADDRESS COPIED');
navigator.clipboard.writeText = async () => { throw new Error('Permission denied'); };
await byId('copy-email').fire('click');
assert.match(byId('copy-status').textContent, /ADDRESS SELECTED/);
window.isSecureContext = false;
await byId('copy-email').fire('click');
assert.equal(byId('copy-status').textContent, 'EMAIL ADDRESS COPIED');
assert(body.appended.removed, 'Temporary clipboard field is removed');
window.scrollY = 1100;
await window.fire('scroll');
assert.equal(byClass('reading-progress')[0].style.width, '50%');

const heroArt = byClass('hero-art')[0];
const firstCard = byClass('project-card')[0];
await heroArt.fire('pointermove', { clientX: 900, clientY: -50 });
assert.equal(heroArt.style['--drift-x'], '11.00px');
assert.equal(heroArt.style['--drift-y'], '-9.00px');
await firstCard.fire('pointermove', { clientX: 900, clientY: -50 });
assert.equal(firstCard.style['--tilt-x'], '1.50deg');
assert.equal(firstCard.style['--tilt-y'], '1.50deg');
await firstCard.fire('pointerleave');
assert.equal(firstCard.style['--tilt-x'], '0deg');
const motionToggle = byId('motion-toggle');
await motionToggle.fire('click');
assert(body.classList.contains('motion-paused'));
assert.equal(motionToggle.getAttribute('aria-pressed'), 'true');
assert.equal(byId('motion-label').textContent, 'Resume motion');
assert.equal(heroArt.style['--drift-x'], '0px');
await heroArt.fire('pointermove', { clientX: 0, clientY: 0 });
assert.equal(heroArt.style['--drift-x'], '0px', 'Pointer motion must stop when paused');
assert(byClass('reveal').every((surface) => surface.classes.has('is-visible')), 'Revealed content stays visible when paused');
await motionToggle.fire('click');
assert(!body.classList.contains('motion-paused'));
assert.equal(motionToggle.getAttribute('aria-pressed'), 'false');
motionPreference.matches = true;
await motionPreference.fire('change');
assert(motionToggle.hidden);
await firstCard.fire('pointermove', { clientX: 600, clientY: 0 });
assert.equal(firstCard.style['--tilt-x'], '0deg', 'Respect reduced motion');
document.hidden = true;
await document.fire('visibilitychange');
assert(body.classList.contains('tab-inactive'));

console.log('PASS: assets, all 9 repositories, filters, 7 dialogs, menu, clipboard, focus, progress, pointer motion bounds, pause/resume, scroll entrances, reduced motion, and inactive-tab pause.');
console.log('Browser rendering and layout are not covered by these checks.');
