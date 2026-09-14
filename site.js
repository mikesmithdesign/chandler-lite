/* Chandler Street Coffee Lite : trimmed engines for the single-page free template.
   Hours, live ticker, today's hours highlight, and scroll reveals. The paid Astro
   theme adds the multi-page nav, daypart tabs, lightbox and colour packs. */

const STATIC = location.search.includes('static');
if (STATIC) document.documentElement.classList.add('static');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis;
if (!STATIC && !REDUCED && window.Lenis) {
  lenis = new Lenis({ lerp: .09 });
  (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })();
}

/* ---------- hours engine : decimal 24h ---------- */
const HOURS = { 0: [8, 14], 1: [7, 16], 2: [7, 16], 3: [7, 16], 4: [7, 16], 5: [7, 16], 6: [8, 16] };
const NOW = new Date(), DAY = NOW.getDay(), HR = NOW.getHours() + NOW.getMinutes() / 60;
const TODAY = HOURS[DAY], IS_OPEN = !!TODAY && HR >= TODAY[0] && HR < TODAY[1];
const fmt = x => { const h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + String(m).padStart(2, '0'); };
let OPEN_MSG;
if (IS_OPEN) OPEN_MSG = 'Open till ' + fmt(TODAY[1]);
else if (TODAY && HR < TODAY[0]) OPEN_MSG = 'Opens ' + fmt(TODAY[0]) + ' today';
else OPEN_MSG = 'Closed, back tomorrow';

const CHIP_MSG = IS_OPEN ? OPEN_MSG : (TODAY && HR < TODAY[0] ? 'Opens ' + fmt(TODAY[0]) : 'Closed now');
document.querySelectorAll('.js-status').forEach(chip => {
  chip.classList.add(IS_OPEN ? 'on' : 'off');
  const t = chip.querySelector('.js-status-text');
  if (t) t.textContent = CHIP_MSG;
});
document.querySelectorAll('.js-open-msg').forEach(el => { el.textContent = OPEN_MSG; });

/* hours board: mark today's group */
document.querySelectorAll('.hgroup').forEach(g => {
  const days = (g.dataset.days || '').split(',').map(Number);
  if (days.includes(DAY)) g.classList.add('today');
});

/* ---------- home: the counter strip (ticker) ---------- */
(function () {
  const tick = document.getElementById('tick');
  if (!tick) return;
  const DAYPARTS = {
    morning: ['Almond croissants, warm', 'Cardamom knots', 'Porridge with burnt honey', 'Batch filter on'],
    midday: ['Mortadella on focaccia', 'Soup with toasted bread', 'Tomato butter beans', 'The big green salad'],
    afternoon: ['Brown butter banana bread', 'Ginger cake, sticky', 'Cheese toasties', 'Batch filter on']
  };
  const leads = { morning: 'Out of the oven this morning', midday: 'On the counter at lunch', afternoon: 'On the counter this afternoon' };
  function currentDaypart() {
    if (STATIC || !IS_OPEN) return 'morning';
    if (HR >= 14.5) return 'afternoon';
    if (HR >= 11) return 'midday';
    return 'morning';
  }
  const dp = currentDaypart();
  const lead = IS_OPEN || STATIC ? leads[dp] : 'Out of the oven every morning';
  const run = '<b>' + lead + '</b><i>&#9642;</i>' + DAYPARTS[dp].join('<i>&#9642;</i>') + '<i>&#9642;</i>';
  function build() {
    tick.innerHTML = run;
    const n = Math.max(1, Math.ceil(innerWidth / (tick.scrollWidth || 1)));
    tick.innerHTML = run.repeat(n * 2);
    tick.style.animationDuration = (36 * n) + 's';
  }
  build();
  if (document.fonts) document.fonts.ready.then(build);
  addEventListener('resize', build);
})();

/* ---------- reveals (sparing) ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .16 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
if (STATIC || REDUCED) document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
