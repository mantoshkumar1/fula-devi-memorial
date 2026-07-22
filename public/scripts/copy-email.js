/**
 * Copy-email — progressive enhancement for the Contact page.
 *
 * Served as a static, same-origin ES module so it loads under the site's strict
 * `script-src 'self'` policy with no inline script and no third-party code.
 * Without it, the email address is still shown in full and the "Email the
 * institution" mailto link still works; this only adds an optional "Copy email"
 * button and a short "Copied." confirmation.
 *
 * Markup contract (see src/pages/contact.astro):
 *   <button data-copy-email="name@example.org" hidden>Copy email</button>
 *   <span data-copy-status role="status"></span>
 * The button stays hidden until this script reveals it, so no inert control ever
 * appears when JavaScript is unavailable.
 */
const button = document.querySelector('[data-copy-email]');

if (button) {
  const email = button.getAttribute('data-copy-email') || '';
  const successMessage = button.getAttribute('data-copy-success') || '';
  const status = document.querySelector('[data-copy-status]');

  // Reveal the control only now that it can actually work.
  button.hidden = false;

  let clearTimer = 0;
  const announce = (message) => {
    if (!status) return;
    status.textContent = message;
    if (clearTimer) clearTimeout(clearTimer);
    // Clear the confirmation after a moment so it never lingers. This is a
    // content change, not an animation.
    clearTimer = setTimeout(() => {
      status.textContent = '';
    }, 4000);
  };

  const copy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        // Fallback for browsers without the async clipboard API.
        const field = document.createElement('textarea');
        field.value = email;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.top = '-9999px';
        document.body.appendChild(field);
        field.select();
        document.execCommand('copy');
        field.remove();
      }
      announce(successMessage);
    } catch {
      // Copying can be blocked by the browser; the address stays on screen to
      // select by hand, so no misleading confirmation is shown.
    }
  };

  button.addEventListener('click', copy);
}
