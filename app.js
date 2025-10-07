// Fetch helpers
async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.text();
}
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  try { return await res.json(); } catch {
    const txt = await res.text();
    return JSON.parse(txt);
  }
}

// About
document.addEventListener('DOMContentLoaded', async () => {
  const aboutEl = document.getElementById('about-text');
  if (!aboutEl) return;
  try {
    const text = await fetchText('data/about.txt');
    aboutEl.textContent = text.trim();
  } catch {
    aboutEl.textContent = 'About info currently unavailable.';
  }
});

// Education (dynamic)
document.addEventListener('DOMContentLoaded', async () => {
  const eduEl = document.getElementById('education-list');
  if (!eduEl) return;
  try {
    const list = await fetchJSON('data/education.json');
    eduEl.innerHTML = '';
    list.forEach(item => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `
        <a href="${item.url}" target="_blank">${item.name}</a>
        ${item.details ? `<span class="badge text-bg-secondary">${item.details}</span>` : ''}
      `;
      eduEl.appendChild(li);
    });
  } catch {
    eduEl.textContent = 'Education info unavailable.';
  }
});

// Projects
function renderProjects(projects) {
  const grid = document.getElementById('project-list');
  if (!grid) return;
  grid.innerHTML = '';
  projects.forEach((proj) => {
    const col = document.createElement('div');
    col.className = 'col-6 col-lg-4';
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
}
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('project-list');
  if (!grid) return;
  try {
    const projects = await fetchJSON('data/projects.json');
    if (Array.isArray(projects)) renderProjects(projects);
    else grid.textContent = 'Projects data unavailable.';
  } catch {
    grid.textContent = 'Projects data unavailable.';
  }
});

// Availability
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
