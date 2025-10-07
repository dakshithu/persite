/* app.js - Loads all dynamic content from JSON files
   - About text from data/about.txt
   - Education from data/education.json 
   - Experience from data/experience.json (new!)
   - Projects from data/projects.json (2 per row mobile, 3 desktop)
   - Availability from data/availability.json (if elements exist)
*/

// ----- Fetch Helpers -----
async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.text();
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    try { 
      return await res.json(); 
    } catch {
      const txt = await res.text();
      try { 
        return JSON.parse(txt); 
      } catch { 
        throw new Error(`Invalid JSON from ${url}`); 
      }
    }
  }
  return res.json();
}

// ----- About Text -----
document.addEventListener('DOMContentLoaded', async () => {
  const aboutEl = document.getElementById('about-text');
  if (!aboutEl) return;
  
  try {
    const text = await fetchText('data/about.txt');
    aboutEl.textContent = text.trim();
  } catch (err) {
    aboutEl.textContent = 'About info currently unavailable.';
    console.warn('Failed to load about:', err);
  }
});

// ----- Education (Dynamic) -----
document.addEventListener('DOMContentLoaded', async () => {
  const eduEl = document.getElementById('education-list');
  if (!eduEl) return;
  
  try {
    const list = await fetchJSON('data/education.json');
    eduEl.innerHTML = '';
    
    if (Array.isArray(list) && list.length > 0) {
      list.forEach(item => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
          <a href="${item.url}" target="_blank" rel="noopener">${item.name}</a>
          ${item.details ? `<span class="badge text-bg-secondary">${item.details}</span>` : ''}
        `;
        eduEl.appendChild(li);
      });
    } else {
      eduEl.innerHTML = '<li class="list-group-item">No education entries found.</li>';
    }
  } catch (err) {
    eduEl.innerHTML = '<li class="list-group-item">Education info unavailable.</li>';
    console.warn('Failed to load education:', err);
  }
});

// ----- Experience (Dynamic) -----
document.addEventListener('DOMContentLoaded', async () => {
  const expEl = document.getElementById('experience-table');
  if (!expEl) return;
  
  try {
    const list = await fetchJSON('data/experience.json');
    
    if (Array.isArray(list) && list.length > 0) {
      expEl.innerHTML = `
        <thead>
          <tr>
            <th>Dates</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(item => 
            `<tr>
              <td>${item.dates}</td>
              <td>${item.role}</td>
            </tr>`
          ).join('')}
        </tbody>
      `;
    } else {
      expEl.innerHTML = '<tbody><tr><td colspan="2">No experience entries found.</td></tr></tbody>';
    }
  } catch (err) {
    expEl.innerHTML = '<tbody><tr><td colspan="2">Experience info unavailable.</td></tr></tbody>';
    console.warn('Failed to load experience:', err);
  }
});

// ----- Projects (Bootstrap Grid: 2 per row mobile, 3 desktop) -----
function renderProjects(projects) {
  const grid = document.getElementById('project-list');
  if (!grid) return;

  grid.innerHTML = '';
  
  if (Array.isArray(projects) && projects.length > 0) {
    projects.forEach((proj) => {
      const col = document.createElement('div');
      col.className = 'col-6 col-lg-4'; // 2 columns on small screens, 3 on large
      col.innerHTML = `
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${proj.title}</h5>
            <p class="card-text">${proj.description || ''}</p>
            <div class="mt-auto">
              <a href="${proj.url}" target="_blank" rel="noopener" class="btn btn-outline-primary btn-sm">Live Demo</a>
            </div>
          </div>
        </div>
      `;
      grid.appendChild(col);
    });
  } else {
    grid.innerHTML = '<div class="col-12 text-center">No projects found.</div>';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const projects = await fetchJSON('data/projects.json');
    renderProjects(projects);
  } catch (err) {
    const grid = document.getElementById('project-list');
    if (grid) grid.innerHTML = '<div class="col-12 text-center">Projects data unavailable.</div>';
    console.warn('Failed to load projects:', err);
  }
});

// ----- Availability (only if elements exist, like on contact page) -----
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
      <p class="mb-1"><strong>Best time to reach:</strong> ${data.time || 'Anytime'}</p>
      <p class="mb-0"><strong>Response time:</strong> ${data.responseTime || 'Usually within 24 hours'}</p>
    `;
  } catch (err) {
    statusEl.textContent = 'Availability data unavailable.';
    detailsEl.textContent = '';
    console.warn('Failed to load availability:', err);
  }
});
