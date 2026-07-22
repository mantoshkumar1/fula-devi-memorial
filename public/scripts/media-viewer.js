/**
 * In-site media viewer — progressive enhancement.
 *
 * Served as a static, same-origin ES module (not bundled) so it loads under the
 * site's strict `script-src 'self'` policy with no inline script and no hash to
 * maintain. Without it, every thumbnail is still a plain link to its full-size
 * file; this script simply upgrades those links into an accessible modal viewer.
 *
 * Thumbnails opt in with data attributes:
 *   <a data-mv data-mv-group="clothing-2021" data-mv-index="0"
 *      data-mv-kind="programme-photo" data-mv-caption="…" href="/…jpg">
 * Items are grouped by `data-mv-group` and ordered by `data-mv-index`, so one
 * year is a single sequence: the lead photograph, then independent coverage
 * where it exists, then the remaining photographs. Clicking any thumbnail opens
 * the sequence at that item. Collections never mix.
 */
const KIND_LABEL = {
  'programme-photo': 'Programme photograph',
  'independent-coverage': 'Independent coverage',
  'academic-record-page': 'Academic record',
};

const dialog = document.querySelector('dialog.mv');
const links = Array.from(document.querySelectorAll('a[data-mv]'));

if (dialog && typeof dialog.showModal === 'function' && links.length) {
  const img = dialog.querySelector('.mv__img');
  const status = dialog.querySelector('.mv__status');
  const caption = dialog.querySelector('.mv__caption');
  const prevBtn = dialog.querySelector('.mv__prev');
  const nextBtn = dialog.querySelector('.mv__next');
  const closeBtn = dialog.querySelector('.mv__close');

  // Group opt-in links, then order each group by its sequence index so the
  // viewer order is the intended one regardless of DOM order.
  const groups = new Map();
  for (const a of links) {
    const key = a.dataset.mvGroup || 'default';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(a);
  }
  for (const list of groups.values()) {
    list.sort(
      (a, b) => Number(a.dataset.mvIndex || 0) - Number(b.dataset.mvIndex || 0),
    );
  }

  let items = [];
  let index = 0;
  let opener = null;

  const preload = (i) => {
    const item = items[i];
    if (item) new Image().src = item.src;
  };

  const render = () => {
    const item = items[index];
    if (!item) return;
    img.src = item.src;
    img.alt = item.caption;
    const kindLabel = KIND_LABEL[item.kind] || '';
    status.textContent =
      `${index + 1} of ${items.length}` + (kindLabel ? ` · ${kindLabel}` : '');
    caption.textContent = item.caption;
    const many = items.length > 1;
    prevBtn.hidden = !many;
    nextBtn.hidden = !many;
    if (many) {
      preload((index + 1) % items.length);
      preload((index - 1 + items.length) % items.length);
    }
  };

  const go = (delta) => {
    if (items.length < 2) return;
    index = (index + delta + items.length) % items.length;
    render();
  };

  const open = (groupKey, start, from) => {
    const group = groups.get(groupKey);
    if (!group) return;
    items = group.map((a) => ({
      src: a.getAttribute('href') || '',
      kind: a.dataset.mvKind || '',
      caption: a.dataset.mvCaption || (a.querySelector('img') && a.querySelector('img').alt) || '',
    }));
    index = start;
    opener = from;
    render();
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    closeBtn.focus();
  };

  for (const a of links) {
    a.addEventListener('click', (event) => {
      // Honour new-tab / modified clicks; otherwise take over.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const key = a.dataset.mvGroup || 'default';
      const start = groups.get(key).indexOf(a);
      open(key, start, a);
    });
  }

  prevBtn.addEventListener('click', () => go(-1));
  nextBtn.addEventListener('click', () => go(1));
  closeBtn.addEventListener('click', () => dialog.close());

  // Click on the dark surround (not the image or a control) closes.
  dialog.addEventListener('click', (event) => {
    if (!event.target.closest('.mv__img, .mv__btn')) dialog.close();
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(-1);
    }
    // Escape is handled natively by <dialog>.
  });

  // Swipe on touch devices. Passive listeners keep pinch-zoom and vertical
  // scrolling working; only a clearly horizontal drag navigates.
  let startX = null;
  let startY = null;
  dialog.addEventListener(
    'touchstart',
    (event) => {
      if (event.touches.length !== 1) {
        startX = null; // a pinch, not a swipe
        return;
      }
      startX = event.changedTouches[0].clientX;
      startY = event.changedTouches[0].clientY;
    },
    { passive: true },
  );
  dialog.addEventListener(
    'touchend',
    (event) => {
      if (startX === null) return;
      const dx = event.changedTouches[0].clientX - startX;
      const dy = event.changedTouches[0].clientY - startY;
      // Navigate only when the movement is clearly horizontal, so vertical
      // scrolling of a tall clipping is never hijacked.
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        go(dx < 0 ? 1 : -1);
      }
      startX = null;
      startY = null;
    },
    { passive: true },
  );

  // Restore scroll lock and return focus to the opening thumbnail.
  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
    img.removeAttribute('src');
    if (opener && typeof opener.focus === 'function') opener.focus();
    opener = null;
  });
}
