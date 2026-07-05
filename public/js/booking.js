const bookingForm = document.getElementById('bookingForm');
const bookingStatus = document.getElementById('bookingStatus');

const params = new URLSearchParams(window.location.search);
const preselect = params.get('service');
if (preselect) {
  const serviceSelect = document.getElementById('b_service');
  const match = Array.from(serviceSelect.options).find((o) => o.value === preselect);
  if (match) serviceSelect.value = preselect;
}

bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  bookingStatus.textContent = '';
  bookingStatus.style.color = '';

  const payload = {
    name: document.getElementById('b_name').value,
    email: document.getElementById('b_email').value,
    phone: document.getElementById('b_phone').value,
    service: document.getElementById('b_service').value,
    preferredDate: document.getElementById('b_date').value,
    preferredTime: document.getElementById('b_time').value,
    message: document.getElementById('b_message').value,
  };

  const submitBtn = bookingForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  try {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Something went wrong. Please try again.');
    }
    bookingForm.reset();
    bookingStatus.style.color = 'var(--accent-soft)';
    bookingStatus.textContent = "Request received! I'll confirm your slot by email within 24 hours.";
  } catch (err) {
    bookingStatus.style.color = 'var(--danger)';
    bookingStatus.textContent = err.message;
  } finally {
    submitBtn.disabled = false;
  }
});
