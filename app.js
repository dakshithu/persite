// Dark Mode Toggle - Bootstrap 5.3 Theme Support
(function(){
  const saved = localStorage.getItem('bsTheme') || 'light';
  document.documentElement.setAttribute('data-bs-theme', saved);

  const toggleBtn = document.getElementById('dark-mode-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-bs-theme', current);
      localStorage.setItem('bsTheme', current);
    });
  }
})();

// Smooth fade-in animations on scroll
document.addEventListener("DOMContentLoaded", () => {
  const observerOptions = { threshold: 0.1 };
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in-on-scroll').forEach(el => observer.observe(el));
});


// Load About Text
document.addEventListener('DOMContentLoaded', () => {
  const aboutTextElem = document.getElementById('about-text');
  if (aboutTextElem) {
    fetch('data/about.txt')
      .then(res => res.ok ? res.text() : Promise.reject('Failed to load about.txt'))
      .then(text => aboutTextElem.textContent = text.trim())
      .catch(() => aboutTextElem.textContent = "About info currently unavailable.");
  }
});

// Load Availability (optional: not needed on main page if only on Contact)
document.addEventListener('DOMContentLoaded', () => {
  const statusElem = document.getElementById('availability-status');
  const detailsElem = document.getElementById('availability-details');
  if (!statusElem || !detailsElem) return;

  fetch('data/availability.json')
    .then(res => res.ok ? res.json() : Promise.reject('Failed to load availability.json'))
    .then(data => {
      const color = data.available ? '#22d685' : '#ff4757';
      statusElem.innerHTML = `
        <span class="status-dot" style="background: ${color}; box-shadow: 0 0 10px ${color}; border-radius: 50%; display:inline-block; width:14px; height:14px; margin-right:8px;"></span>
        <span style="color:${color}; font-weight:600;">${data.available ? 'Available for new projects' : 'Not available for new projects'}</span>
      `;
      detailsElem.innerHTML = `
        <p><strong>Best time to reach:</strong> ${data.time}</p>
        <p><strong>Response time:</strong> ${data.responseTime || 'Usually within 24 hours'}</p>
      `;
    })
    .catch(() => {
      statusElem.textContent = 'Availability data unavailable.';
      detailsElem.textContent = '';
    });
});

// Render Projects with Bootstrap Cards (2 cols on mobile, 3 on desktop)
function renderProjects(projects) {
  const grid = document.getElementById('project-list');
  if (!grid) return;
  grid.innerHTML = '';

  projects.forEach(proj => {
    const col = document.createElement('div');
    col.className = 'col-6 col-lg-4';  // 2 per row small, 3 per row lg
    col.innerHTML = `
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${proj.title}</h5>
          <div class="mt-auto">
            <a href="${proj.url}" target="_blank" class="btn btn-outline-primary btn-sm">Live Demo</a>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });
}

// Fetch projects and render
document.addEventListener('DOMContentLoaded', () => {
  fetch('data/projects.json')
    .then(res => res.ok ? res.json() : Promise.reject('Failed to load projects.json'))
    .then(renderProjects)
    .catch(() => {
      const grid = document.getElementById('project-list');
      if (grid) grid.textContent = 'Projects data unavailable.';
    });
});

// Animate Skill Bars (if you have progress bars with .progress-bar and data-width attributes)
document.addEventListener('DOMContentLoaded', () => {
  const bars = document.querySelectorAll('.progress-bar[data-width]');
  bars.forEach(bar => {
    // Animate to desired width over 750ms
    const width = bar.getAttribute('data-width');
    setTimeout(() => { bar.style.width = width + '%'; }, 300);
  });
});
