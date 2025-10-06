// Universal Dark Mode Logic (runs on both pages)
function applyDarkModeSetting() {
    const setting = localStorage.getItem('darkMode');
    if (setting === 'on') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// Apply dark mode immediately when page loads
applyDarkModeSetting();

// Age calculation and display (only for main page)
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

// Set age when page loads (only if age element exists)
document.addEventListener('DOMContentLoaded', function() {
    const ageElem = document.getElementById('age-highlight');
    if (ageElem) {
        const age = calculateAge('2013-06-30');
        ageElem.innerHTML = `<span class="age-glow">${age} years old</span>`;
    }
});

// Add age glow CSS
const ageStyle = document.createElement('style');
ageStyle.textContent = `
.age-glow {
    font-family: 'Poppins', Arial, sans-serif;
    font-size: 1.35rem;
    font-weight: 900;
    color: #22d685;
    letter-spacing: 2px;
    margin: 16px 0 0 0;
    text-shadow: 0 0 3px rgba(34,214,133,0.3), 0 0 2px #22d685;
    animation: glow 2s ease-in-out infinite alternate;
    display: block;
}
@keyframes glow {
    from { text-shadow: 0 0 2px #22d68588, 0 0 1px #22d685; }
    to   { text-shadow: 0 0 7px #22d68599, 0 0 3px #22d685; }
}
`;
document.head.appendChild(ageStyle);

// Dark mode toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const darkToggle = document.getElementById('dark-mode-toggle');
    if (darkToggle) {
        darkToggle.addEventListener('click', function () {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode',
                document.body.classList.contains('dark-mode') ? 'on' : 'off'
            );
        });
    }
});

// Listen for storage changes (for cross-tab sync)
window.addEventListener('storage', function() {
    applyDarkModeSetting();
});

// Main page scroll animations
document.addEventListener("DOMContentLoaded", () => {
    // Intersection Observer for scroll-triggered animations
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Special handling for different sections
                if (entry.target.id === 'education') {
                    const eduItems = entry.target.querySelectorAll('.edu-list li');
                    eduItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('animate');
                        }, index * 150);
                    });
                }
                
                if (entry.target.id === 'experience') {
                    const table = entry.target.querySelector('table');
                    setTimeout(() => {
                        table.classList.add('animate');
                    }, 200);
                }
                
                if (entry.target.id === 'skills') {
                    const skills = entry.target.querySelectorAll('.skill');
                    skills.forEach((skill, index) => {
                        setTimeout(() => {
                            skill.classList.add('animate');
                        }, index * 150);
                    });
                    
                    // Animate skill bars after skills appear
                    setTimeout(() => {
                        entry.target.querySelectorAll('.skill-bar').forEach(bar => {
                            bar.style.width = bar.getAttribute("data-width") + "%";
                        });
                    }, skills.length * 150 + 300);
                }
                
                if (entry.target.id === 'projects') {
                    const projectCards = entry.target.querySelectorAll('.project-card');
                    projectCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('animate');
                        }, index * 100);
                    });
                }
                
                // Unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all sections with animate-on-scroll class
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
