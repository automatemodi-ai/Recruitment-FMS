export function prepareTables(root) {
  root.querySelectorAll('table').forEach(table => {
    const isReport = table.classList.contains('report-summary-table');
    const isHistory = table.classList.contains('history-table');
    const headers = [...table.querySelectorAll('thead th')].map(th => th.textContent.trim());
    table.setAttribute('role', 'table');
    table.querySelectorAll('th').forEach(th => th.setAttribute('scope', 'col'));
    if (!isReport && !isHistory) {
      table.classList.add('record-table');
      table.querySelectorAll('tr').forEach(row => row.setAttribute('role', 'row'));
      table.querySelectorAll('tbody tr').forEach(row => {
        [...row.cells].forEach((cell, index) => {
          cell.setAttribute('role', 'cell');
          if (cell.colSpan > 1) { cell.classList.add('empty-cell'); return; }
          cell.dataset.label = headers[index] || '';
        });
      });
    }
    let wrapper = table.parentElement;
    if (isHistory && !wrapper.classList.contains('table-scroll')) {
      wrapper = document.createElement('div');
      table.before(wrapper);
      wrapper.append(table);
    }
    wrapper.classList.add(isHistory || isReport ? 'table-scroll' : 'record-table-container');
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', isHistory ? 'Stage history, scroll horizontally for more columns' : isReport ? 'Recruitment report, scroll horizontally for more columns' : 'Recruitment records');
    table.querySelectorAll('select').forEach(select => {
      select.setAttribute('aria-label', `${select.closest('td')?.dataset.label || 'Stage'} for ${select.dataset.id || 'record'}`);
    });
  });
}

export function revealActiveTabs(root) {
  root.querySelectorAll('.pipeline-tabs, .vacancy-workflow-tabs, .report-tabs').forEach(strip => {
    const active = strip.querySelector('.active');
    if (!active) return;
    const stripRect = strip.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    if (activeRect.right > stripRect.right) strip.scrollLeft += activeRect.right - stripRect.right + 8;
    if (activeRect.left < stripRect.left) strip.scrollLeft -= stripRect.left - activeRect.left + 8;
  });
}

let dialogId = 0;
export function mountModal(modal) {
  const previousFocus = document.activeElement;
  document.body.append(modal);
  prepareTables(modal);
  const dialog = modal.querySelector('.modal');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.tabIndex = -1;
  const heading = dialog.querySelector('h2');
  if (heading) {
    heading.id = `dialog-title-${++dialogId}`;
    dialog.setAttribute('aria-labelledby', heading.id);
  }
  const close = modal.querySelector('.modal-close');
  close?.setAttribute('aria-label', 'Close dialog');
  const background = [...document.body.children].filter(el => el !== modal && (el.id === 'app' || el.classList.contains('modal-backdrop')));
  const inertState = background.map(el => el.inert);
  background.forEach(el => { el.inert = true; });
  document.body.classList.add('modal-open');
  close?.focus({ preventScroll: true });
  modal.addEventListener('keydown', event => {
    if (modal.inert) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close?.click(); }
    if (event.key === 'Tab') {
      const controls = [...dialog.querySelectorAll('button, a[href], input:not([disabled]), select:not([disabled]), textarea, [tabindex="0"]')].filter(el => el.getClientRects().length && !el.disabled);
      const first = controls[0]; const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });
  const observer = new MutationObserver(() => {
    if (modal.isConnected) return;
    observer.disconnect();
    background.forEach((el, i) => { el.inert = inertState[i]; });
    if (!document.querySelector('.modal-backdrop')) document.body.classList.remove('modal-open');
    if (previousFocus?.isConnected && !previousFocus.closest('[inert]')) previousFocus.focus({ preventScroll: true });
    else document.querySelector('#main-content')?.focus({ preventScroll: true });
  });
  observer.observe(document.body, { childList: true });
}
