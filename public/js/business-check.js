(function () {
  'use strict';
  const form = document.getElementById('readiness-check');
  const result = document.getElementById('check-result');
  if (!form || !result) return;

  const steps = [
    { id: 'discover', advice: 'Make your business easy to find: create a clear mobile-friendly page showing what you offer and how to reach you.' },
    { id: 'contact', advice: 'Add a visible call, email or WhatsApp contact option so customers know exactly how to enquire.' },
    { id: 'offer', advice: 'Display products or services with useful descriptions, current prices where appropriate, and clear availability.' },
    { id: 'mobile', advice: 'Test your pages on an ordinary phone; make text, navigation and contact buttons easy to use.' },
    { id: 'followup', advice: 'Record enquiries and follow up consistently, using a private spreadsheet or simple customer-management tool.' },
    { id: 'trust', advice: 'Show genuine business identity and transparent service terms; use real examples and avoid invented reviews.' },
    { id: 'workflow', advice: 'Identify one repetitive task worth simplifying with a small system or carefully reviewed automation.' }
  ];

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const missing = steps.filter(function (s) { return data.get(s.id) !== '1'; });
    const score = steps.length - missing.length;
    const level = score <= 2 ? 'Start with the basics' : score <= 5 ? 'Build stronger foundations' : 'Keep improving';
    const intro = score <= 2
      ? 'There are several practical improvements that could make your business easier to discover and contact.'
      : score <= 5
        ? 'You already have a foundation. Address the remaining customer-experience gaps one at a time.'
        : 'Your business has many useful digital basics. Keep testing the customer journey and making improvements.';

    document.getElementById('check-score').textContent = score + ' / ' + steps.length + ' · ' + level;
    document.getElementById('check-result-intro').textContent = intro;
    const list = document.getElementById('check-next-steps');
    list.replaceChildren();
    (missing.length ? missing : [{ advice: 'Ask a real customer to test discovery, enquiry and follow-up from start to finish.' }])
      .slice(0, 3).forEach(function (item) {
        const li = document.createElement('li');
        li.textContent = item.advice;
        list.appendChild(li);
      });
    const text = [
      'Hello MABRIG Technologies, I completed the free business readiness check.',
      'Result: ' + score + ' / ' + steps.length,
      'I would like to discuss practical improvements for my business.',
      'Website: https://www.mabrigkorie.org/business/check'
    ].join('\n');
    document.getElementById('check-discuss').href =
      'https://wa.me/2347065342818?text=' + encodeURIComponent(text);
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('check-reset').addEventListener('click', function () {
    form.reset();
    result.hidden = true;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('check-share').addEventListener('click', async function () {
    const url = 'https://www.mabrigkorie.org/business/check';
    const caption = 'How ready is your business for customers online? Try this free seven-question self-check. No sign-in required.';
    const note = document.getElementById('share-message');
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Free Business Readiness Check', text: caption, url });
        note.textContent = 'Thanks for sharing.';
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(caption + '\n' + url);
        note.textContent = 'A link to the free check has been copied.';
      } else {
        note.textContent = 'Share this URL: ' + url;
      }
    } catch (error) {
      note.textContent = 'Share this URL: ' + url;
    }
  });
})();
