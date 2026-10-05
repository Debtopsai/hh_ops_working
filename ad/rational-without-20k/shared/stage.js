/* HireHospo ad stage runtime - no build step, vanilla JS.
 *
 * Every frame page includes this. It:
 *  - fits the fixed 1080x1920 .stage to the window (scale 1 at a true 1080x1920 viewport)
 *  - maps data-at / data-dur (seconds) on [data-anim] elements to CSS vars
 *  - runs [data-count-to] counters from the same clock
 *  - exposes HH.play(), HH.seek(t), HH.duration, and accepts the same via postMessage
 *    ({hh:'play'} / {hh:'seek', t}) so index.html can drive frames inside iframes (works on file://)
 *  - URL flags: ?record (no chrome, no cursor, autoplay once)  ?embed (wait for the parent)
 *               ?guides (draw the safe area)  ?t=1.2 (freeze at a time, for stills)
 *  - respects prefers-reduced-motion (jumps to the end state)
 */
(function () {
  const params = new URLSearchParams(location.search);
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (params.has('record')) root.classList.add('record');
  if (params.has('guides')) root.classList.add('guides');

  let duration = 0, startedAt = null, raf = 0, frozenAt = null;

  function fit() {
    const stage = document.querySelector('.stage');
    if (!stage) return;
    const s = Math.min(innerWidth / 1080, innerHeight / 1920);
    stage.style.transform = s === 1 ? 'none' : `scale(${s})`;
  }

  function prepare() {
    duration = parseFloat(document.body.dataset.dur || '0');
    document.querySelectorAll('[data-anim]').forEach(el => {
      if (el.dataset.at) el.style.setProperty('--at', el.dataset.at + 's');
      if (el.dataset.dur) el.style.setProperty('--dur', el.dataset.dur + 's');
    });
  }

  function fmt(n) { return Math.round(n).toLocaleString('en-NZ'); }

  function renderCounters(t) {
    document.querySelectorAll('[data-count-to]').forEach(el => {
      const to = parseFloat(el.dataset.countTo);
      const at = parseFloat(el.dataset.at || '0'), dur = parseFloat(el.dataset.dur || '0.7');
      const p = Math.min(1, Math.max(0, (t - at) / dur));
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (el.dataset.prefix || '') + fmt(to * eased);
    });
  }

  function loop() {
    const t = (performance.now() - startedAt) / 1000;
    renderCounters(t);
    if (t < duration + 0.1) raf = requestAnimationFrame(loop);
    else window.HH.done = true;
  }

  function animations() {
    return document.getAnimations ? document.getAnimations() : [];
  }

  function play() {
    cancelAnimationFrame(raf);
    frozenAt = null;
    window.HH.done = false;
    if (!root.classList.contains('play')) { root.classList.add('play'); void root.offsetWidth; }
    // rewind + resume every CSS animation (also un-pauses ones frozen by seek)
    animations().forEach(a => { a.currentTime = 0; a.play(); });
    if (reduced) { seek(duration); window.HH.done = true; return; }
    startedAt = performance.now();
    raf = requestAnimationFrame(loop);
  }

  // Freeze the whole frame at time t (seconds). Deterministic: used for stills and review.
  function seek(t) {
    cancelAnimationFrame(raf);
    frozenAt = t;
    if (!root.classList.contains('play')) { root.classList.add('play'); void root.offsetWidth; }
    animations().forEach(a => { a.pause(); a.currentTime = t * 1000; });
    renderCounters(t);
  }

  function reset() { seek(0); }

  window.HH = { play, seek, reset, get duration() { return duration; }, done: false };

  addEventListener('message', e => {
    const d = e.data || {};
    if (d.hh === 'play') play();
    else if (d.hh === 'seek') seek(d.t || 0);
  });
  addEventListener('resize', fit);

  function boot() {
    prepare(); fit();
    const ready = document.fonts ? document.fonts.ready : Promise.resolve();
    ready.then(() => {
      if (params.has('t')) seek(parseFloat(params.get('t')));
      else if (params.has('embed')) reset();
      else play();
      if (parent !== window) parent.postMessage({ hh: 'ready', frame: document.body.dataset.frame }, '*');
    });
    if (!params.has('embed') && !params.has('record')) {
      // replay on click / R when viewing a frame on its own
      addEventListener('click', play);
      addEventListener('keydown', e => { if (e.key === 'r' || e.key === 'R' || e.key === ' ') play(); });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
