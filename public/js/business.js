(function () {
  'use strict';
  const form = document.getElementById('business-enquiry');
  if (!form) return;
  const serviceSelect = document.getElementById('business-service');
  const error = document.getElementById('business-form-error');

  document.querySelectorAll('[data-service-choice]').forEach(function (link) {
    link.addEventListener('click', function () {
      serviceSelect.value = link.getAttribute('data-service-choice') || '';
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    error.hidden = true;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const get = function (key, max) {
      return String(values.get(key) || '').trim().slice(0, max);
    };
    const campaign = new URLSearchParams(location.search);
    const source = [campaign.get('utm_source'), campaign.get('utm_campaign')]
      .filter(Boolean).map(function (s) { return s.slice(0, 50).replace(/[^a-zA-Z0-9_.-]/g, ''); })
      .filter(Boolean).join(' / ');
    const lines = [
      'Hello MABRIG Technologies, I would like a project quotation.',
      'Business: ' + get('business', 80),
      'Market: ' + get('market', 40),
      'Service: ' + get('service', 60),
      'Goal: ' + get('goal', 450),
      'Budget: ' + (get('budget', 50) || 'To discuss'),
      source ? 'Enquiry source: ' + source : '',
      'Website: www.mabrigkorie.org/business'
    ].filter(Boolean);
    const text = lines.join('\n');
    if (text.length > 1200) {
      error.textContent = 'Please shorten your project description before continuing.';
      error.hidden = false;
      return;
    }
    location.assign('https://wa.me/2347065342818?text=' + encodeURIComponent(text));
  });
})();
