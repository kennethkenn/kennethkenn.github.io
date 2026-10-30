// Contact form: submit in place and report the result inline.
(function () {
  var form = document.querySelector('.contact-form-container form');
  if (!form) return;

  var submit = form.querySelector('[type="submit"]');
  var btnText = submit && submit.querySelector('.btn-text');
  var btnLoader = submit && submit.querySelector('.btn-loader');
  var status = document.querySelector('[data-form-status]');
  var endpoint = 'kenneth@themintcoder.org';

  function setBusy(busy) {
    if (!submit) return;
    submit.disabled = busy;
    if (btnText) btnText.hidden = busy;
    if (btnLoader) btnLoader.hidden = !busy;
  }

  function showStatus(message, kind) {
    if (!status) return;
    status.textContent = message;
    status.hidden = false;
    status.classList.remove('is-success', 'is-error');
    status.classList.add(kind === 'error' ? 'is-error' : 'is-success');
    try {
      status.focus({ preventScroll: false });
    } catch (e) { }
  }

  form.addEventListener('submit', function (event) {
    // Fall back to a normal POST if fetch is unavailable.
    if (!window.fetch) return;

    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (status) status.hidden = true;
    setBusy(true);

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (response) {
        if (response.ok) return null;
        return response.json().catch(function () { return {}; }).then(function (data) {
          var detail = data && data.errors
            ? data.errors.map(function (err) { return err.message; }).join(' ')
            : '';
          throw new Error(detail || 'The message could not be sent.');
        });
      })
      .then(function () {
        form.reset();
        showStatus('Thanks — your message is on its way. I usually reply within a day or two.', 'success');
      })
      .catch(function (error) {
        var reason = (error && error.message) ? error.message : 'Something went wrong.';
        showStatus(reason + ' You can also email ' + endpoint + '.', 'error');
      })
      .finally(function () {
        setBusy(false);
      });
  });
})();
