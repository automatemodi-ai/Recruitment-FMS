// Keep desktop collapse and mobile drawer state separate when the viewport changes.
export function setupNavigation() {
  const shell = document.querySelector('.shell');
  const sidebar = document.querySelector('#primary-sidebar');
  const content = document.querySelector('.app-content');
  const toggle = document.querySelector('#navigation-toggle');
  const close = document.querySelector('#navigation-close');
  const backdrop = document.querySelector('.navigation-backdrop');
  const mobile = window.matchMedia('(max-width: 1024px)');
  const events = new AbortController();
  let collapsed = false;
  let open = false;
  try { collapsed = localStorage.getItem('recruitment_fms_nav_collapsed') === 'true'; } catch {}

  function update() {
    shell.classList.toggle('sidebar-collapsed', !mobile.matches && collapsed);
    shell.classList.toggle('navigation-open', mobile.matches && open);
    sidebar.inert = mobile.matches && !open;
    content.inert = mobile.matches && open;
    backdrop.hidden = !mobile.matches || !open;
    toggle.setAttribute('aria-expanded', String(mobile.matches ? open : !collapsed));
    toggle.setAttribute('aria-label', mobile.matches ? 'Open navigation' : collapsed ? 'Expand navigation' : 'Collapse navigation');
    toggle.title = toggle.getAttribute('aria-label');
    document.body.classList.toggle('navigation-locked', mobile.matches && open);
    if (mobile.matches && open) {
      sidebar.setAttribute('role', 'dialog');
      sidebar.setAttribute('aria-modal', 'true');
    } else {
      sidebar.removeAttribute('role');
      sidebar.removeAttribute('aria-modal');
    }
  }

  function dismiss(restoreFocus = true) {
    open = false;
    update();
    if (restoreFocus && mobile.matches) toggle.focus();
  }
  toggle.addEventListener('click', () => {
    if (mobile.matches) {
      open = !open;
      update();
      if (open) close.focus();
    } else {
      collapsed = !collapsed;
      try { localStorage.setItem('recruitment_fms_nav_collapsed', String(collapsed)); } catch {}
      update();
    }
  }, { signal: events.signal });
  close.addEventListener('click', () => dismiss(), { signal: events.signal });
  backdrop.addEventListener('click', () => dismiss(), { signal: events.signal });
  document.addEventListener('keydown', event => {
    if (!mobile.matches || !open) return;
    if (event.key === 'Escape') { event.preventDefault(); dismiss(); }
    if (event.key === 'Tab') {
      const controls = [...sidebar.querySelectorAll('button, a[href]')].filter(el => el.getClientRects().length);
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }, { signal: events.signal });
  const resize = () => {
    const focusWasInSidebar = sidebar.contains(document.activeElement);
    open = false;
    update();
    if (focusWasInSidebar) toggle.focus();
  };
  mobile.addEventListener('change', resize);
  update();
  return {
    close: dismiss,
    destroy() {
      events.abort();
      mobile.removeEventListener('change', resize);
      document.body.classList.remove('navigation-locked');
    }
  };
}
