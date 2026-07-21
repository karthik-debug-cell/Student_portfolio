/**
 * ===================================================
 * toast.js – Lightweight Toast Notification Library
 * ===================================================
 * Creates animated, auto-dismissing toast messages
 * matching the portfolio's dark glassmorphism theme.
 *
 * Usage:
 *   showToast('Your message here', 'success');
 *   showToast('Something went wrong', 'error');
 *   showToast('Processing...', 'info');
 */

'use strict';

(function () {

  /* ---- Inject required styles ---- */
  const style = document.createElement('style');
  style.textContent = `
    #toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      min-width: 300px;
      max-width: 420px;
      padding: 1rem 1.25rem;
      border-radius: 0.875rem;
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1.5;
      color: #f1f5f9;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
      pointer-events: all;
      cursor: pointer;
      opacity: 0;
      transform: translateX(120%);
      transition: opacity 0.35s cubic-bezier(0.4,0,0.2,1),
                  transform 0.35s cubic-bezier(0.4,0,0.2,1);
      will-change: transform, opacity;
    }

    .toast.toast-enter {
      opacity: 1;
      transform: translateX(0);
    }

    .toast.toast-exit {
      opacity: 0;
      transform: translateX(120%);
    }

    .toast-success { background: rgba(16, 185, 129, 0.15); border-color: rgba(16,185,129,0.3); }
    .toast-error   { background: rgba(239, 68,  68,  0.15); border-color: rgba(239,68,68,0.3);  }
    .toast-info    { background: rgba(99,  102, 241, 0.15); border-color: rgba(99,102,241,0.3); }

    .toast-icon {
      font-size: 1.1rem;
      flex-shrink: 0;
      margin-top: 0.05rem;
    }

    .toast-body { flex: 1; }
    .toast-title { font-weight: 700; margin-bottom: 0.2rem; }
    .toast-msg   { color: #cbd5e1; font-size: 0.82rem; }

    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 2px;
      border-radius: 0 0 0.875rem 0.875rem;
      animation: toast-shrink linear forwards;
    }
    .toast-success .toast-progress { background: #10b981; }
    .toast-error   .toast-progress { background: #ef4444; }
    .toast-info    .toast-progress { background: #6366f1; }

    @keyframes toast-shrink {
      from { width: 100%; }
      to   { width: 0%;   }
    }

    @media (max-width: 480px) {
      #toast-container { right: 1rem; left: 1rem; }
      .toast { min-width: unset; width: 100%; }
    }
  `;
  document.head.appendChild(style);

  /* ---- Container ---- */
  let container = null;

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  /* ---- Core function ---- */
  /**
   * Display a toast notification.
   * @param {string} message   - Main message text
   * @param {'success'|'error'|'info'} type - Toast type (default: 'info')
   * @param {string} [title]   - Optional bold title
   * @param {number} [duration]- Auto-dismiss duration in ms (default: 4000)
   */
  function showToast(message, type = 'info', title = '', duration = 4000) {
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const titles = { success: 'Success', error: 'Error', info: 'Info' };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.position = 'relative';
    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true">${icons[type] || '🔔'}</span>
      <div class="toast-body">
        <div class="toast-title">${title || titles[type] || ''}</div>
        <div class="toast-msg">${message}</div>
      </div>
      <div class="toast-progress" style="animation-duration:${duration}ms"></div>
    `;

    toast.addEventListener('click', () => dismiss(toast));

    getContainer().appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('toast-enter'));
    });

    // Auto-dismiss
    const timer = setTimeout(() => dismiss(toast), duration);

    function dismiss(el) {
      clearTimeout(timer);
      el.classList.remove('toast-enter');
      el.classList.add('toast-exit');
      el.addEventListener('transitionend', () => el.remove(), { once: true });
    }

    return toast;
  }

  // Expose globally
  window.showToast = showToast;

})();
