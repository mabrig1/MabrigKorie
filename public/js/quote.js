(function () {
  'use strict';
  const fields = {
    client:'p-client', contact:'p-contact', title:'p-title',
    scope:'p-scope', timeline:'p-timeline', terms:'p-terms', valid:'p-valid'
  };
  const form = document.getElementById('quote-form');
  if (!form) return;

  const get = function (key) {
    const el = document.getElementById('q-' + key);
    return el ? el.value.trim() : '';
  };
  const formatAmount = function (amount, currency) {
    try {
      return new Intl.NumberFormat('en', { style:'currency',currency,maximumFractionDigits:2 })
        .format(Number(amount) || 0);
    } catch (error) { return currency + ' ' + (Number(amount) || 0).toFixed(2); }
  };
  const refresh = function () {
    Object.keys(fields).forEach(function (key) {
      document.getElementById(fields[key]).textContent = get(key) || (key === 'contact' ? 'Contact to be confirmed' : 'To be agreed');
    });
    document.getElementById('p-amount').textContent = formatAmount(get('amount'),get('currency'));
  };
  form.addEventListener('input',refresh);
  form.addEventListener('change',refresh);
  refresh();

  document.getElementById('q-print').addEventListener('click',function () {
    if (form.reportValidity()) window.print();
  });

  document.getElementById('q-copy').addEventListener('click',async function () {
    if (!form.reportValidity()) return;
    const text = [
      'MABRIG Technologies — Project Quotation',
      'Client: ' + get('client'),
      'Contact: ' + get('contact'),
      'Project: ' + get('title'),
      'Scope:\n' + get('scope'),
      'Timeline: ' + get('timeline'),
      'Amount: ' + formatAmount(get('amount'),get('currency')),
      'Valid until: ' + get('valid'),
      'Terms:\n' + get('terms'),
      'Contact: mabrig@mabrigkorie.org | +2347065342818',
      'This is a quotation, not proof of payment.'
    ].join('\n\n');
    const feedback = document.getElementById('quote-feedback');
    try {
      await navigator.clipboard.writeText(text);
      feedback.textContent = 'Quotation copied. Review the terms before sending it to your customer.';
    } catch (error) {
      feedback.textContent = 'Clipboard unavailable. Use Print / Save as PDF instead.';
    }
  });
})();
