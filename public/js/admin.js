const SHARE_BASE = window.location.origin;

let works = [];
let editingId = null;

const modalOverlay = document.getElementById('modalOverlay');
const workForm = document.getElementById('workForm');
const categoryFilter = document.getElementById('categoryFilter');

async function loadWorks() {
  const res = await fetch('/api/works');
  works = await res.json();
  renderStats();
  renderList();
}

function renderStats() {
  const counts = { app: 0, research: 0, book: 0, music: 0, service: 0 };
  works.forEach((w) => { if (counts[w.category] !== undefined) counts[w.category]++; });
  const labels = { app: 'Apps', research: 'Research', book: 'Books', music: 'Music', service: 'Services' };
  document.getElementById('statRow').innerHTML = Object.keys(counts)
    .map((k) => `<div class="stat-card"><div class="num">${counts[k]}</div><div class="lbl">${labels[k]}</div></div>`)
    .join('') + `<div class="stat-card"><div class="num">${works.length}</div><div class="lbl">Total Works</div></div>`;
}

function renderList() {
  const filter = categoryFilter.value;
  const filtered = filter ? works.filter((w) => w.category === filter) : works;
  const list = document.getElementById('workList');

  if (filtered.length === 0) {
    list.innerHTML = `<p style="color:var(--muted);text-align:center;padding:30px;">No works yet. Click "Add Work" to get started.</p>`;
    return;
  }

  list.innerHTML = filtered.map((w) => {
    const shareUrl = encodeURIComponent(w.url || `${SHARE_BASE}/work/${w.slug}`);
    const shareText = encodeURIComponent(w.title);
    return `
    <div class="work-row" data-id="${w._id}">
      <div class="meta">
        <div class="title">${escapeHtml(w.title)} ${w.featured ? '⭐' : ''}</div>
        <div class="sub">${w.category} · /work/${w.slug}</div>
      </div>
      <div class="share-row">
        <a class="share-btn" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}">X</a>
        <a class="share-btn" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}">FB</a>
        <a class="share-btn" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}">LinkedIn</a>
        <a class="share-btn" target="_blank" rel="noopener" href="https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}">WhatsApp</a>
        <a class="share-btn" target="_blank" rel="noopener" href="https://t.me/share/url?url=${shareUrl}&text=${shareText}">Telegram</a>
      </div>
      <div class="actions">
        <button class="btn btn-ghost btn-sm" data-action="edit" data-id="${w._id}">Edit</button>
        <button class="btn btn-danger btn-sm" data-action="delete" data-id="${w._id}">Delete</button>
      </div>
    </div>`;
  }).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function openModal(work) {
  editingId = work ? work._id : null;
  document.getElementById('modalTitle').textContent = work ? 'Edit Work' : 'Add Work';
  document.getElementById('workId').value = work ? work._id : '';
  document.getElementById('f_category').value = work ? work.category : 'app';
  document.getElementById('f_title').value = work ? work.title : '';
  document.getElementById('f_description').value = work ? work.description : '';
  document.getElementById('f_url').value = work ? (work.url || '') : '';
  document.getElementById('f_platform').value = work ? (work.platform || '') : '';
  document.getElementById('f_tags').value = work ? (work.tags || []).join(', ') : '';
  document.getElementById('f_image').value = work ? (work.image || '') : '';
  document.getElementById('f_content').value = work ? (work.content || '') : '';
  document.getElementById('f_slug').value = work ? work.slug : '';
  document.getElementById('f_order').value = work ? work.order : 0;
  document.getElementById('f_featured').checked = work ? !!work.featured : false;
  document.getElementById('f_seoTitle').value = work ? (work.seoTitle || '') : '';
  document.getElementById('f_seoDescription').value = work ? (work.seoDescription || '') : '';
  document.getElementById('f_seoKeywords').value = work ? (work.seoKeywords || []).join(', ') : '';
  updateSeoPreview();
  modalOverlay.classList.add('open');
}

function closeModal() {
  modalOverlay.classList.remove('open');
  workForm.reset();
  editingId = null;
}

function updateSeoPreview() {
  const title = document.getElementById('f_seoTitle').value || document.getElementById('f_title').value || 'Page Title';
  const desc = document.getElementById('f_seoDescription').value || document.getElementById('f_description').value || 'Page description appears here.';
  const slug = document.getElementById('f_slug').value || 'your-slug';

  document.getElementById('seoPreview').innerHTML = `
    <div class="sp-title">${escapeHtml(title)}</div>
    <div class="sp-url">${SHARE_BASE.replace(/^https?:\/\//, '')}/work/${escapeHtml(slug)}</div>
    <div class="sp-desc">${escapeHtml(desc)}</div>
  `;

  const checks = [];
  if (title.length > 0 && title.length <= 60) checks.push(['ok', '✓ SEO title length is good (' + title.length + ' chars)']);
  else checks.push(['warn', '⚠ SEO title should be under 60 characters (' + title.length + ')']);

  if (desc.length >= 50 && desc.length <= 160) checks.push(['ok', '✓ Description length is good (' + desc.length + ' chars)']);
  else checks.push(['warn', '⚠ Description should be 50–160 characters (' + desc.length + ')']);

  const kw = document.getElementById('f_seoKeywords').value;
  if (kw.trim()) checks.push(['ok', '✓ Keywords set']);
  else checks.push(['warn', '⚠ No keywords set']);

  if (document.getElementById('f_image').value) checks.push(['ok', '✓ Social preview image set']);
  else checks.push(['warn', '⚠ No image — social shares will be text-only']);

  document.getElementById('seoCheck').innerHTML = checks
    .map(([cls, txt]) => `<span class="${cls}">${txt}</span>`)
    .join('');
}

document.getElementById('addWorkBtn').addEventListener('click', () => openModal(null));
document.getElementById('cancelBtn').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
categoryFilter.addEventListener('change', renderList);

['f_title', 'f_description', 'f_seoTitle', 'f_seoDescription', 'f_seoKeywords', 'f_slug', 'f_image'].forEach((id) => {
  document.getElementById(id).addEventListener('input', updateSeoPreview);
});

document.getElementById('workList').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;
  const work = works.find((w) => w._id === id);

  if (btn.dataset.action === 'edit') {
    openModal(work);
  } else if (btn.dataset.action === 'delete') {
    if (!confirm(`Delete "${work.title}"?`)) return;
    await fetch(`/api/works/${id}`, { method: 'DELETE' });
    await loadWorks();
  }
});

workForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    category: document.getElementById('f_category').value,
    title: document.getElementById('f_title').value,
    description: document.getElementById('f_description').value,
    url: document.getElementById('f_url').value,
    platform: document.getElementById('f_platform').value,
    tags: document.getElementById('f_tags').value,
    image: document.getElementById('f_image').value,
    content: document.getElementById('f_content').value,
    slug: document.getElementById('f_slug').value,
    order: document.getElementById('f_order').value,
    featured: document.getElementById('f_featured').checked,
    seoTitle: document.getElementById('f_seoTitle').value,
    seoDescription: document.getElementById('f_seoDescription').value,
    seoKeywords: document.getElementById('f_seoKeywords').value,
  };

  const url = editingId ? `/api/works/${editingId}` : '/api/works';
  const method = editingId ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    alert('Error: ' + err.error);
    return;
  }

  closeModal();
  await loadWorks();
});

loadWorks();

// ===== Social Links =====
let socialLinks = [];
let editingSocialId = null;
const socialModalOverlay = document.getElementById('socialModalOverlay');
const socialForm = document.getElementById('socialForm');

async function loadSocialLinks() {
  const res = await fetch('/api/social-links');
  socialLinks = await res.json();
  renderSocialList();
}

function renderSocialList() {
  const list = document.getElementById('socialList');
  if (socialLinks.length === 0) {
    list.innerHTML = `<p style="color:var(--muted);text-align:center;padding:20px;">No social links yet.</p>`;
    return;
  }
  list.innerHTML = socialLinks.map((s) => `
    <div class="work-row" data-id="${s._id}">
      <div class="meta">
        <div class="title">${s.icon || ''} ${escapeHtml(s.platform)}</div>
        <div class="sub">${escapeHtml(s.url)}</div>
      </div>
      <div class="actions">
        <button class="btn btn-ghost btn-sm" data-action="edit-social" data-id="${s._id}">Edit</button>
        <button class="btn btn-danger btn-sm" data-action="delete-social" data-id="${s._id}">Delete</button>
      </div>
    </div>
  `).join('');
}

function openSocialModal(link) {
  editingSocialId = link ? link._id : null;
  document.getElementById('socialModalTitle').textContent = link ? 'Edit Social Link' : 'Add Social Link';
  document.getElementById('s_id').value = link ? link._id : '';
  document.getElementById('s_platform').value = link ? link.platform : '';
  document.getElementById('s_url').value = link ? link.url : '';
  document.getElementById('s_icon').value = link ? (link.icon || '') : '';
  document.getElementById('s_order').value = link ? link.order : 0;
  socialModalOverlay.classList.add('open');
}

function closeSocialModal() {
  socialModalOverlay.classList.remove('open');
  socialForm.reset();
  editingSocialId = null;
}

document.getElementById('addSocialBtn').addEventListener('click', () => openSocialModal(null));
document.getElementById('socialCancelBtn').addEventListener('click', closeSocialModal);
socialModalOverlay.addEventListener('click', (e) => { if (e.target === socialModalOverlay) closeSocialModal(); });

document.getElementById('socialList').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;
  const link = socialLinks.find((s) => s._id === id);

  if (btn.dataset.action === 'edit-social') {
    openSocialModal(link);
  } else if (btn.dataset.action === 'delete-social') {
    if (!confirm(`Delete "${link.platform}"?`)) return;
    await fetch(`/api/social-links/${id}`, { method: 'DELETE' });
    await loadSocialLinks();
  }
});

socialForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    platform: document.getElementById('s_platform').value,
    url: document.getElementById('s_url').value,
    icon: document.getElementById('s_icon').value,
    order: document.getElementById('s_order').value,
  };
  const url = editingSocialId ? `/api/social-links/${editingSocialId}` : '/api/social-links';
  const method = editingSocialId ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    alert('Error: ' + err.error);
    return;
  }
  closeSocialModal();
  await loadSocialLinks();
});

loadSocialLinks();
