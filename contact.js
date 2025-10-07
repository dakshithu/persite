// Fetch helpers
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  try { return await res.json(); } catch {
    const txt = await res.text();
    return JSON.parse(txt);
  }
}

// Dynamic Contact Info
document.addEventListener('DOMContentLoaded', async () => {
  const infoEl = document.getElementById('contact-info');
  if (!infoEl) return;
  try {
    const item = await fetchJSON('data/contact.json');
    infoEl.innerHTML = `
      <div class="card h-100">
        <div class="card-body">
          <h3 class="h5 mb-3 text-center">How to Reach Me</h3>
          <div class="d-flex align-items-center p-3 rounded bg-body-secondary mb-3">
            <div class="me-3 fs-5">✉</div>
            <div>
              <div class="small text-secondary mb-1">Email</div>
              <a href="mailto:${item.email}">${item.email}</a>
            </div>
          </div>
          <div class="d-flex align-items-center p-3 rounded bg-body-secondary mb-3">
            <div class="me-3 fs-5">☎</div>
            <div>
              <div class="small text-secondary mb-1">Phone</div>
              <a href="tel:${item.phone}">${item.phone}</a>
            </div>
          </div>
          <div class="d-flex align-items-center p-3 rounded bg-body-secondary mb-3">
            <div class="me-3 fs-5">🌐</div>
            <div>
              <div class="small text-secondary mb-1">LinkedIn</div>
              <a href="${item.linkedin}" target="_blank">${item.linkedinUser}</a>
            </div>
          </div>
          <div class="mt-4 text-center">
            <a class="btn btn-outline-primary btn-sm me-2" href="${item.github}" target="_blank">GitHub</a>
            <a class="btn btn-outline-primary btn-sm" href="${item.linkedin}" target="_blank">LinkedIn</a>
          </div>
        </div>
      </div>
    `;
  } catch {
    infoEl.textContent = 'Contact info unavailable.';
  }
});

// Availability (same as app.js)
document.addEventListener('DOMContentLoaded', async () => {
  const statusEl = document.getElementById('availability-status');
  const detailsEl = document.getElementById('availability-details');
  if (!statusEl || !detailsEl) return;
  try {
    const data = await fetchJSON('data/availability.json');
    const available = !!data.available;
    const color = available ? '#22d685' : '#ff4757';
    statusEl.innerHTML = `
      <span class="status-dot" style="background:${color}; box-shadow:0 0 10px ${color}; border-radius:50%; display:inline-block; width:14px; height:14px; margin-right:8px;"></span>
      <span style="color:${color}; font-weight:600;">${available ? 'Available for new projects' : 'Not available for new projects'}</span>
    `;
    detailsEl.innerHTML = `
      <p class="mb-1"><strong>Best time to reach:</strong> ${data.time || ''}</p>
      <p class="mb-0"><strong>Response time:</strong> ${data.responseTime || 'Usually within 24 hours'}</p>
    `;
  } catch {
    statusEl.textContent = 'Availability data unavailable.';
    detailsEl.textContent = '';
  }
});
