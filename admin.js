// Dark Mode
function applyDarkModeSetting() {
    const setting = localStorage.getItem('darkMode');
    if (setting === 'on') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}
applyDarkModeSetting();
document.getElementById('dark-mode-toggle').onclick = function () {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode',
        document.body.classList.contains('dark-mode') ? 'on' : 'off'
    );
};
window.addEventListener('storage', function() {
    applyDarkModeSetting();
});

// GitHub API
class GitHubAdmin {
    constructor() {
        this.token = '';
        this.repo = '';
        this.baseUrl = 'https://api.github.com';
    }
    async request(endpoint, options={}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Authorization': `token ${this.token}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        const response = await fetch(url, config);
        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
    async getFile(path) {
        try { return await this.request(`/repos/${this.repo}/contents/${path}`);}
        catch (err) { if(`${err}`.includes('404')) return null; throw err; }
    }
    async updateFile(path, content, message, sha=null) {
        const body = {
            message, content: btoa(unescape(encodeURIComponent(content)))
        };
        if (sha) body.sha = sha;
        return await this.request(`/repos/${this.repo}/contents/${path}`, {
            method: 'PUT', body: JSON.stringify(body)
        });
    }
    async testConnection() { return await this.request(`/repos/${this.repo}`);}
}

// Data storage
const admin = new GitHubAdmin();
let currentData = {
    about: '',
    availability: { available: true, time: '9 AM - 6 PM (GMT+4)', responseTime: 'Usually within 24 hours' },
    projects: []
};

// --- Login system
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = document.getElementById('github-token').value.trim();
    const repo = document.getElementById('repo-name').value.trim();
    if (!token || !repo) {
        showError('login-error', 'Please fill in all fields');
        return;
    }
    admin.token = token;
    admin.repo = repo;
    try {
        const repoInfo = await admin.testConnection();
        sessionStorage.setItem('github_token', token);
        sessionStorage.setItem('github_repo', repo);
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';
        document.getElementById('repo-info').innerHTML = `Connected to: <strong>${repoInfo.full_name}</strong> | Updated: ${new Date(repoInfo.updated_at).toLocaleDateString()}`;
        await loadAllData();
    } catch (error) {
        showError('login-error', `Connection failed: ${error.message}`);
    }
});
document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.clear();
    location.reload();
});
window.addEventListener('load', () => {
    const token = sessionStorage.getItem('github_token');
    const repo = sessionStorage.getItem('github_repo');
    if (token && repo) {
        admin.token = token;
        admin.repo = repo;
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';
        loadAllData();
    }
});

// ---- All data load
async function loadAllData() {
    await loadAboutData();
    await loadAvailabilityData();
    await loadProjectsData();
}
// ---- Load About
async function loadAboutData() {
    const file = await admin.getFile('data/about.txt');
    currentData.about = file ? atob(file.content).trim() : "";
    document.getElementById('about-textarea').value = currentData.about;
}
// ---- Load Availability
async function loadAvailabilityData() {
    const file = await admin.getFile('data/availability.json');
    currentData.availability = file
        ? JSON.parse(atob(file.content))
        : { available: true, time: "9 AM - 6 PM (GMT+4)", responseTime: "Usually within 24 hours" };
    document.getElementById('is-available').checked = currentData.availability.available;
    document.getElementById('availability-time').value = currentData.availability.time;
    document.getElementById('response-time').value = currentData.availability.responseTime || "";
}
// ---- Load Projects
async function loadProjectsData() {
    const file = await admin.getFile('data/projects.json');
    currentData.projects = file
        ? JSON.parse(atob(file.content))
        : [];
    renderProjects();
}

// ---- About Save
document.getElementById('about-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const aboutText = document.getElementById('about-textarea').value.trim();
    if (!aboutText) {
        showError('about-message', 'About text cannot be empty'); return;
    }
    try {
        showLoading('about-form');
        const existingFile = await admin.getFile('data/about.txt');
        await admin.updateFile('data/about.txt', aboutText, 'Update about via admin panel', existingFile ? existingFile.sha : null);
        showSuccess('about-message', 'About updated!');
    } catch (error) {
        showError('about-message', `Failed: ${error.message}`);
    } finally { hideLoading('about-form');}
});

// ---- Availability Save
document.getElementById('availability-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const availData = {
        available: document.getElementById('is-available').checked,
        time: document.getElementById('availability-time').value.trim(),
        responseTime: document.getElementById('response-time').value.trim()
    };
    try {
        showLoading('availability-form');
        const existingFile = await admin.getFile('data/availability.json');
        await admin.updateFile('data/availability.json', JSON.stringify(availData, null, 2),
            'Update availability via admin panel', existingFile ? existingFile.sha : null
        );
        showSuccess('availability-message', 'Availability updated!');
    } catch (error) {
        showError('availability-message', `Failed: ${error.message}`);
    } finally { hideLoading('availability-form'); }
});

// ----- Project CRUD -----
function renderProjects() {
    const list = document.getElementById('projects-list');
    list.innerHTML = '';
    currentData.projects.forEach((project, i) => {
        const li = document.createElement('li');
        li.className = 'project-item';
        li.innerHTML = `
            <div>
                <div class="project-title">${project.title}</div>
                <div class="project-url">${project.url}</div>
            </div>
            <div class="project-actions">
                <button onclick="editProject(${i})" class="project-btn">Edit</button>
                <button onclick="deleteProject(${i})" class="project-btn" style="background:#ff4757;">Delete</button>
            </div>
        `;
        list.appendChild(li);
    });
}

window.editProject = async function(index) {
    const p = currentData.projects[index];
    const newTitle = prompt("Edit title:", p.title);
    if (!newTitle) return;
    const newUrl = prompt("Edit URL:", p.url);
    if (!newUrl) return;
    currentData.projects[index] = { title: newTitle, url: newUrl };
    try {
        await saveProjectsData();
        renderProjects();
        showSuccess('projects-message', 'Project updated!');
    } catch (error) {
        showError('projects-message', `Failed to update project: ${error.message}`);
    }
};

window.deleteProject = async function(index) {
    if (!confirm('Delete this project?')) return;
    const removed = currentData.projects.splice(index, 1)[0];
    try {
        await saveProjectsData();
        renderProjects();
        showSuccess('projects-message', 'Project deleted!');
    } catch (error) {
        currentData.projects.splice(index, 0, removed);
        showError('projects-message', `Failed to delete project: ${error.message}`);
    }
};

document.getElementById('add-project-form').addEventListener('submit', async function(e){
    e.preventDefault();
    const title = document.getElementById('project-title').value.trim();
    const url = document.getElementById('project-url').value.trim();
    if (!title || !url){
        showError('projects-message', 'Please fill all fields');
        return;
    }
    currentData.projects.push({title, url});
    try {
        await saveProjectsData();
        renderProjects();
        document.getElementById('add-project-form').reset();
        showSuccess('projects-message', 'Project added!');
    } catch (error) {
        currentData.projects.pop();
        showError('projects-message', `Failed to add project: ${error.message}`);
    }
});

async function saveProjectsData() {
    const existingFile = await admin.getFile('data/projects.json');
    await admin.updateFile(
        'data/projects.json',
        JSON.stringify(currentData.projects, null, 2),
        'Update projects via admin panel',
        existingFile ? existingFile.sha : null
    );
}

// --- UI helpers
function showError(id, msg){
    const el = document.getElementById(id);
    el.textContent = msg; el.className = 'error-message';
}
function showSuccess(id, msg){
    const el = document.getElementById(id);
    el.textContent = msg; el.className = 'success-message';
    setTimeout(()=>{el.textContent='';},2500)
}
function showLoading(formId) { document.getElementById(formId).classList.add('loading'); }
function hideLoading(formId) { document.getElementById(formId).classList.remove('loading'); }
