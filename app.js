/* app.js
   - Custom dark mode using body.dark-mode + localStorage('darkMode') [web:18][web:21][web:22]
   - Loads about.txt into #about-text
   - Loads projects.json and renders as Bootstrap cards (col-6 col-lg-4)
   - Optionally loads availability.json when availability containers exist
   - Keeps to vanilla JS + Bootstrap layout classes only
*/

// ----- Dark Mode (Custom) -----
(function initDarkMode() {
  const saved = localStorage.getItem('darkMode') === 'on';
  document.body.classList.toggle('dark-mode', saved);

  const toggleBtn = document.getElementById('dark-mode-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const nowOn = document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', nowOn ? 'on' : 'off');
    });
  }

  // Sync between tabs
  window.addEventListener('storage', (e) => {
    if (e.key === 'darkMode') {
      document.body.classList.toggle('dark-mode', e.newValue === 'on');
    }
  });
})(); // [web:18][web:21][web:22]

// ----- Utility: safe fetch helpers -----
async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.text();
} // [web:24][web:33]

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    // Try parse anyway; some static hosts serve json as text/plain
    try { return await res.json(); } catch {
      const txt = await res.text();
      try { return JSON.parse(txt); } catch { throw new Error(`Invalid JSON from ${url}`); }
    }
  }
  return res.json();
} // [web:27][web:24][web:33]

// ----- About -----
document.addEventListener('DOMContentLoaded', async () => {
  const aboutEl = document.getElementById('about-text');
  if (!aboutEl) return;
  try {
    const text = await fetchText('data/about.txt');
    aboutEl.textContent = text.trim();
  } catch (err) {
    aboutEl.textContent = 'About info currently unavailable.';
    // console.warn(err);
  }
}); // [web:24]

// ----- Projects (2 per row mobile, 3 per row desktop) -----
function renderProjects(projects) {
  const grid = document.getElementById('project-list');
  if (!grid) return;

  grid.innerHTML = '';
  projects.forEach((proj) => {
    const col = document.createElement('div');
    col.className = 'col-6 col-lg-4'; // 2 columns on small, 3 on large [Bootstrap grid]
    col.innerHTML = `
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${proj.title}</h5>
          <div class="mt-auto">
            <a href="${proj.url}" target="_blank" rel="noopener" class="btn btn-outline-primary btn-sm">Live Demo</a>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });
} // [web:23][web:32]

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('project-list');
  if (!grid) return;
  try {
    const projects = await fetchJSON('data/projects.json');
    if (Array.isArray(projects)) renderProjects(projects);
    else grid.textContent = 'Projects data unavailable.';
  } catch (err) {
    grid.textContent = 'Projects data unavailable.';
    // console.warn(err);
  }
}); // [web:24][web:33]

// ----- Availability (only if elements exist on page) -----
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
  } catch (err) {
    statusEl.textContent = 'Availability data unavailable.';
    detailsEl.textContent = '';
    // console.warn(err);
  }
}); // [web:24][web:33]
