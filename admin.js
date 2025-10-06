// ========= DARK MODE =========
function applyDarkModeSetting() {
    const setting = localStorage.getItem('darkMode');
    if (setting === 'on') {
        document.body.classList.add('dark-mode');
    }
}
applyDarkModeSetting();
document.getElementById('dark-mode-toggle').onclick = function () {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode',
        document.body.classList.contains('dark-mode') ? 'on' : 'off'
    );
};

// ========= GITHUB API CLASS =========
class GitHubAdmin {
    constructor() {
        this.token = '';
        this.repo = '';
        this.baseUrl = 'https://api.github.com';
    }

    async request(endpoint, options = {}) {
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
        try {
            return await this.request(`/repos/${this.repo}/contents/${path}`);
        } catch (error) {
            if (error.message.includes('404')) {
                return null; // File doesn't exist
            }
            throw error;
        }
    }

    async updateFile(path, content, message, sha = null) {
        const body = {
            message: message,
            content: btoa(unescape(encodeURIComponent(content)))
        };
        
        if (sha) {
            body.sha = sha;
        }

        return await this.request(`/repos/${this.repo}/contents/${path}`, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    async testConnection() {
        return await this.request(`/repos/${this.repo}`);
    }
}

// ========= ADMIN SYSTEM =========
const admin = new GitHubAdmin();
let currentData = {
    about: '',
    availability: {
        available: true,
        time: '9 AM - 6 PM (GMT+4)',
        responseTime: 'Usually within 24 hours'
    },
    projects: []
};

// Login System
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
        // Test connection
        const repoInfo = await admin.testConnection();
        
        // Store credentials (in session, not localStorage for security)
        sessionStorage.setItem('github_token', token);
        sessionStorage.setItem('github_repo', repo);
        
        // Show admin panel
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';
        
        // Display repo info
        document.getElementById('repo-info').innerHTML = 
            `Connected to: <strong>${repoInfo.full_name}</strong> | Updated: ${new Date(repoInfo.updated_at).toLocaleDateString()}`;
        
        // Load current data
        await loadAllData();
        
    } catch (error) {
        showError('login-error', `Connection failed: ${error.message}`);
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.clear();
    location.reload();
});

// Check if already logged in
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

// ========= DATA MANAGEMENT =========
async function loadAllData() {
    try {
        await loadAboutData();
        await loadAvailabilityData();
        await loadProjectsData();
    } catch (error) {
        console.error('Failed to load data:', error);
    }
}

async function loadAboutData() {
    try {
        const file = await admin.getFile('data/about.txt');
        if (file) {
            currentData.about = atob(file.content).trim();
            document.getElementById('about-textarea').value = currentData.about;
        }
    } catch (error) {
        console.error('Failed to load about data:', error);
    }
}

async function loadAvailabilityData() {
    try {
        const file = await admin.getFile('data/availability.json');
        if (file) {
            currentData.availability = JSON.parse(atob(file.content));
            document.getElementById('is-available').checked = currentData.availability.available;
            document.getElementById('availability-time').value = currentData.availability.time;
            document.getElementById('response-time').value = currentData.availability.responseTime;
        }
    } catch (error) {
        console.error('Failed to load availability data:', error);
    }
}

async function loadProjectsData() {
    try {
        const file = await admin.getFile('data/projects.json');
        if (file) {
            currentData.projects = JSON.parse(atob(file.content));
        } else {
            // Default projects if file doesn't exist
            currentData.projects = [
                {title: "DigiClock", url: "https://dakshdigiclock.netlify.app/"},
                {title: "SimpleCalculator", url: "https://dakshcalc.netlify.app/"},
                {title: "Sustainable Living Info", url: "https://susliving.netlify.app/"},
                {title: "To-do List", url: "https://dakshtodo.netlify.app/"},
                {title: "Games App", url: "https://dakigames.netlify.app/"}
            ];
        }
        renderProjects();
    } catch (error) {
        console.error('Failed to load projects data:', error);
    }
}

// ========= FORM HANDLERS =========
document.getElementById('about-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const aboutText = document.getElementById('about-textarea').value.trim();
    
    if (!aboutText) {
        showError('about-message', 'About text cannot be empty');
        return;
    }

    try {
        showLoading('about-form');
        
        const existingFile = await admin.getFile('data/about.txt');
        await admin.updateFile(
            'data/about.txt',
            aboutText,
            'Update about description via admin panel',
            existingFile ? existingFile.sha : null
        );
        
        currentData.about = aboutText;
        showSuccess('about-message', 'About description updated successfully!');
        
    } catch (error) {
        showError('about-message', `Failed to update: ${error.message}`);
    } finally {
        hideLoading('about-form');
    }
});

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
        await admin.updateFile(
            'data/availability.json',
            JSON.stringify(availData, null, 2),
            'Update availability settings via admin panel',
            existingFile ? existingFile.sha : null
        );
        
        currentData.availability = availData;
        showSuccess('availability-message', 'Availability settings updated successfully!');
        
    } catch (error) {
        showError('availability-message', `Failed to update: ${error.message}`);
    } finally {
        hideLoading('availability-form');
    }
});

document.getElementById('add-project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('project-title').value.trim();
    const url = document.getElementById('project-url').value.trim();
    
    if (!title || !url) {
        showError('projects-message', 'Please fill in all project fields');
        return;
    }

    currentData.projects.push({ title, url });
    
    try {
        await saveProjectsData();
        document.getElementById('add-project-form').reset();
        renderProjects();
        showSuccess('projects-message', 'Project added successfully!');
    } catch (error) {
        currentData.projects.pop(); // Remove the added project on error
        showError('projects-message', `Failed to add project: ${error.message}`);
    }
});

// ========= PROJECTS RENDERING =========
function renderProjects() {
    const list = document.getElementById('projects-list');
    list.innerHTML = '';
    
    currentData.projects.forEach((project, index) => {
        const li = document.createElement('li');
        li.className = 'project-item';
        li.innerHTML = `
            <div>
                <div class="project-title">${project.title}</div>
                <div class="project-url">${project.url}</div>
            </div>
            <div class="project-actions">
                <button onclick="editProject(${index})" class="project-btn">Edit</button>
                <button onclick="deleteProject(${index})" class="project-btn" style="background:#ff4757;">Delete</button>
            </div>
        `;
        list.appendChild(li);
    });
}

window.editProject = async function(index) {
    const project = currentData.projects[index];
    const newTitle = prompt('Edit title:', project.title);
    if (newTitle && newTitle.trim()) {
        const newUrl = prompt('Edit URL:', project.url);
        if (newUrl && newUrl.trim()) {
            currentData.projects[index] = { title: newTitle.trim(), url: newUrl.trim() };
            try {
                await saveProjectsData();
                renderProjects();
                showSuccess('projects-message', 'Project updated successfully!');
            } catch (error) {
                showError('projects-message', `Failed to update project: ${error.message}`);
            }
        }
    }
};

window.deleteProject = async function(index) {
    if (confirm('Are you sure you want to delete this project?')) {
        const removedProject = currentData.projects.splice(index, 1)[0];
        try {
            await saveProjectsData();
            renderProjects();
            showSuccess('projects-message', 'Project deleted successfully!');
        } catch (error) {
            currentData.projects.splice(index, 0, removedProject); // Restore on error
            showError('projects-message', `Failed to delete project: ${error.message}`);
        }
    }
};

async function saveProjectsData() {
    const existingFile = await admin.getFile('data/projects.json');
    await admin.updateFile(
        'data/projects.json',
        JSON.stringify(currentData.projects, null, 2),
        'Update projects via admin panel',
        existingFile ? existingFile.sha : null
    );
}

// ========= UI HELPERS =========
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = 'error-message';
}

function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = 'success-message';
    setTimeout(() => {
        element.textContent = '';
    }, 3000);
}

function showLoading(formId) {
    document.getElementById(formId).classList.add('loading');
}

function hideLoading(formId) {
    document.getElementById(formId).classList.remove('loading');
}
