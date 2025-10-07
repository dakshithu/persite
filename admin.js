// ---- Setup: CHANGE THESE ----
const GITHUB_REPO = 'yourusername/yourrepo'; // Example: 'daki247/portfolio'
const BRANCH = 'main';

// ---- Utility ----
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return await res.json();
}
function b64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

// ---- GitHub API save function ----
async function githubSave(path, data, message, token, repo=GITHUB_REPO, branch=BRANCH) {
  const fileUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
  const headers = { Authorization:`token ${token}`, 'Content-Type':'application/json' };
  const getResp = await fetch(fileUrl, { headers });
  if (!getResp.ok) throw new Error('Failed to load file for SHA');
  const file = await getResp.json();
  const putResp = await fetch(fileUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message,
      content: b64(data),
      sha: file.sha,
      branch
    })
  });
  if (!putResp.ok) throw new Error('Failed to update file');
  return await putResp.json();
}

// ---- Contact Info ----
let contactData;
async function renderContact() {
  contactData = await fetchJSON('data/contact.json');
  const form = document.getElementById('admin-contact');
  if (!form) return;
  form.innerHTML = `
    <div class="mb-2">
      <label class="form-label">Email</label>
      <input type="email" class="form-control" id="contact-email" value="${contactData.email||''}">
    </div>
    <div class="mb-2">
      <label class="form-label">Phone</label>
      <input type="tel" class="form-control" id="contact-phone" value="${contactData.phone||''}">
    </div>
    <div class="mb-2">
      <label class="form-label">LinkedIn</label>
      <input type="url" class="form-control" id="contact-linkedin" value="${contactData.linkedin||''}">
    </div>
    <div class="mb-2">
      <label class="form-label">GitHub</label>
      <input type="url" class="form-control" id="contact-github" value="${contactData.github||''}">
    </div>
    <div class="mb-2">
      <label class="form-label">GitHub Username</label>
      <input type="text" class="form-control" id="github-username" value="${(contactData.github||'').split('/').pop()}">
      <button class="btn btn-secondary mt-2" id="fetch-github" type="button">Fetch GitHub Stats</button>
    </div>
  `;
  document.getElementById('fetch-github').onclick = fetchGithubStats;
}
async function fetchGithubStats() {
  const username = document.getElementById('github-username').value;
  const statsEl = document.getElementById('github-stats');
  if (!username) { statsEl.textContent = ""; return; }
  statsEl.textContent = 'Loading GitHub data...';
  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) throw new Error("Not found");
    const user = await res.json();
    statsEl.innerHTML = `
      <div>
        <strong>${user.login}</strong><br>
        Public repos: ${user.public_repos}<br>
        Followers: ${user.followers}<br>
        Following: ${user.following}<br>
        <img src="${user.avatar_url}" alt="GitHub Avatar" style="width:64px;height:64px;border-radius:50%;margin-top:8px;">
      </div>
    `;
  } catch {
    statsEl.innerHTML = "<span class='text-danger'>Could not fetch GitHub info.</span>";
  }
}
document.getElementById('save-contact').onclick = async () => {
  contactData.email = document.getElementById('contact-email').value;
  contactData.phone = document.getElementById('contact-phone').value;
  contactData.linkedin = document.getElementById('contact-linkedin').value;
  contactData.github = document.getElementById('contact-github').value;
  const token = prompt("GitHub Personal Access Token:");
  await githubSave(
    'data/contact.json',
    JSON.stringify(contactData, null, 2),
    "Update contact info from admin",
    token
  );
  alert('Contact info saved!');
};

// ---- Education ----
let educationData;
async function renderEducation() {
  educationData = await fetchJSON('data/education.json');
  const form = document.getElementById('admin-education');
  if (!form) return;
  form.innerHTML = '';
  educationData.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'input-group mb-2';
    row.innerHTML = `
      <input type="text" class="form-control" value="${item.name}" placeholder="Institute" data-i="${i}" data-k="name">
      <input type="url" class="form-control" value="${item.url}" placeholder="URL" data-i="${i}" data-k="url">
      <input type="text" class="form-control" value="${item.details||''}" placeholder="Details" data-i="${i}" data-k="details">
      <button class="btn btn-danger" type="button" data-rm="${i}">&times;</button>
    `;
    row.querySelectorAll('.form-control').forEach(inp => {
      inp.onchange = e => {
        educationData[i][inp.getAttribute('data-k')] = inp.value;
      };
    });
    row.querySelector('.btn-danger').onclick = () => {
      educationData.splice(i, 1); renderEducation();
    };
    form.appendChild(row);
  });
  // Add option
  const addBtn = document.createElement('button');
  addBtn.className = 'btn btn-success btn-sm mt-2';
  addBtn.type = 'button';
  addBtn.textContent = 'Add Education';
  addBtn.onclick = () => { educationData.push({ name: '', url: '', details:'' }); renderEducation(); };
  form.appendChild(addBtn);
}
document.getElementById('save-education').onclick = async () => {
  const token = prompt("GitHub Personal Access Token:");
  await githubSave(
    'data/education.json',
    JSON.stringify(educationData, null, 2),
    "Update education.json from admin",
    token
  );
  alert('Education saved!');
};

// ---- Experience ----
let experienceData;
async function renderExperience() {
  experienceData = await fetchJSON('data/experience.json');
  const form = document.getElementById('admin-experience');
  if (!form) return;
  form.innerHTML = '';
  experienceData.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'input-group mb-2';
    row.innerHTML = `
      <input type="text" class="form-control" value="${item.dates}" placeholder="Dates" data-i="${i}" data-k="dates">
      <input type="text" class="form-control" value="${item.role}" placeholder="Role" data-i="${i}" data-k="role">
      <button class="btn btn-danger" type="button" data-rm="${i}">&times;</button>
    `;
    row.querySelectorAll('.form-control').forEach(inp => {
      inp.onchange = e => {
        experienceData[i][inp.getAttribute('data-k')] = inp.value;
      };
    });
    row.querySelector('.btn-danger').onclick = () => {
      experienceData.splice(i, 1); renderExperience();
    };
    form.appendChild(row);
  });
  // Add button
  const addBtn = document.createElement('button');
  addBtn.className = 'btn btn-success btn-sm mt-2';
  addBtn.type = 'button';
  addBtn.textContent = 'Add Experience';
  addBtn.onclick = () => { experienceData.push({ dates: '', role:'' }); renderExperience(); };
  form.appendChild(addBtn);
}
document.getElementById('save-experience').onclick = async () => {
  const token = prompt("GitHub Personal Access Token:");
  await githubSave(
    'data/experience.json',
    JSON.stringify(experienceData, null, 2),
    "Update experience.json from admin",
    token
  );
  alert('Experience saved!');
};

// ---- On Load: Show All ----
document.addEventListener('DOMContentLoaded', () => {
  renderContact();
  renderEducation();
  renderExperience();
});
