// ========== DARK MODE ==========
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

// =========== AGE ==============
function calculateAge(birthDateString) {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}
document.addEventListener('DOMContentLoaded', function() {
    const ageElem = document.getElementById('age-highlight');
    if (ageElem) {
        const age = calculateAge('2013-06-30');
        ageElem.innerHTML = `<span class="age-large">${age} years old</span>`;
    }
});

// ========== DYNAMIC ABOUT ===========
document.addEventListener('DOMContentLoaded', function() {
    fetch('data/about.txt')
        .then(r => r.ok ? r.text() : "Couldn't load about text")
        .then(text => {
            document.getElementById('about-text').textContent = text.trim();
        });
});

// ========== DYNAMIC AVAILABILITY ===========
document.addEventListener('DOMContentLoaded', function() {
    fetch('data/availability.json')
        .then(r => r.ok ? r.json() : null)
        .then(data => {
            if(data){
                let availStatus = data.available
                    ? `<span style="color:#22d685;font-weight:700;">Available for new projects</span>`
                    : `<span style="color:#ff4757;font-weight:700;">Not available for new projects</span>`;
                document.getElementById('availability-status').innerHTML = availStatus;
                document.getElementById('availability-details').innerHTML = `
                    <b>Best time to reach:</b> ${data.time}<br>
                    <b>Response time:</b> ${data.responseTime ? data.responseTime : 'Usually within 24 hours'}`;
            } else {
                document.getElementById('availability-status').textContent = 'Unavailable';
                document.getElementById('availability-details').textContent = '';
            }
        });
});

// ========== DYNAMIC PROJECTS ===========
document.addEventListener('DOMContentLoaded', function() {
    fetch('data/projects.json')
        .then(r => r.ok ? r.json() : [])
        .then(projects => {
            const grid = document.getElementById('project-list');
            grid.innerHTML = '';
            projects.forEach(proj => {
                const card = document.createElement('div');
                card.className = 'project-card';
                card.innerHTML = `<h4>${proj.title}</h4>
                    <a href="${proj.url}" target="_blank">Live Demo</a>`;
                grid.appendChild(card);
            });
        });
});

// ========== SCROLL ANIMATIONS ===========
document.addEventListener("DOMContentLoaded", () => {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                if (entry.target.id === 'education') {
                    const eduItems = entry.target.querySelectorAll('.edu-list li');
                    eduItems.forEach((item, index) => {
                        setTimeout(() => { item.classList.add('animate'); }, index * 150);
                    });
                }
                if (entry.target.id === 'experience') {
                    const table = entry.target.querySelector('table');
                    setTimeout(() => { table.classList.add('animate'); }, 200);
                }
                if (entry.target.id === 'skills') {
                    const skills = entry.target.querySelectorAll('.skill');
                    skills.forEach((skill, index) => {
                        setTimeout(() => { skill.classList.add('animate'); }, index * 150);
                    });
                    setTimeout(() => {
                        entry.target.querySelectorAll('.skill-bar').forEach(bar => {
                            bar.style.width = bar.getAttribute("data-width") + "%";
                        });
                    }, skills.length * 150 + 300);
                }
                if (entry.target.id === 'projects') {
                    const projectCards = entry.target.querySelectorAll('.project-card');
                    projectCards.forEach((card, index) => {
                        setTimeout(() => { card.classList.add('animate'); }, index * 100);
                    });
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll, #education, #experience, #skills, #projects').forEach(section => {
        observer.observe(section);
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
