// ========== DARK MODE ==========
function applyDarkModeSetting() {
    const setting = localStorage.getItem('darkMode');
    if (setting === 'on') document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
}
applyDarkModeSetting();
document.getElementById('dark-mode-toggle').onclick = function () {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode',
        document.body.classList.contains('dark-mode') ? 'on' : 'off');
};
window.addEventListener('storage', applyDarkModeSetting);

// ========== ANIMATIONS ==========
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, {threshold:0.2, rootMargin:'0px 0px -50px 0px'});

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
});

// ========== DYNAMIC AVAILABILITY ===========
document.addEventListener('DOMContentLoaded', () => {
    const statusElem = document.getElementById('availability-status');
    const detailsElem = document.getElementById('availability-details');
    const defaultAvailability = {
        available: true,
        time: '9 AM - 6 PM (GMT+4)',
        responseTime: 'Usually within 24 hours'
    };

    fetch('./data/availability.json')
        .then(resp => {
            if(!resp.ok) throw new Error('Not found');
            return resp.json();
        })
        .then(data => {
            const available = data.available;
            const color = available ? '#22d685' : '#ff4757';
            statusElem.innerHTML = `
                <span class="status-dot" style="background:${color}; box-shadow:0 0 5px ${color};"></span>
                <span style="color:${color};">${available ? 'Available for new projects' : 'Not available for new projects'}</span>
            `;
            detailsElem.innerHTML = `
                <p><strong>Best time to reach:</strong> ${data.time}</p>
                <p><strong>Response time:</strong> ${data.responseTime || 'Usually within 24 hours'}</p>
            `;
        })
        .catch(() => {
            // fallback
            statusElem.innerHTML = `<span class="status-dot"></span><span style="color:#22d685;">Available for new projects</span>`;
            detailsElem.innerHTML = `
                <p><strong>Best time to reach:</strong> ${defaultAvailability.time}</p>
                <p><strong>Response time:</strong> ${defaultAvailability.responseTime}</p>
            `;
        });
});

// ========== FORM HANDLING ===========
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const submitBtn = form.querySelector('.submit-btn');

    form.addEventListener('submit', e => {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        if(!name || !email || !message){
            e.preventDefault();
            showNotification('Please fill in all required fields', 'error');
            shakeButton();
            return;
        }

        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Sending...';
        setTimeout(() => {
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Send Message';
            showNotification('Message prepared! Your email client should open.', 'success');
        }, 1700);
    });
});

function showNotification(message, type){
    const note = document.createElement('div');
    note.textContent = message;
    note.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 12px;
        color: white; font-weight: 500; z-index: 1000; animation: slideIn 0.3s ease;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        background: ${type==='success' ? 'linear-gradient(135deg, #22d685, #0066ff)' : 'linear-gradient(135deg, #ff4757, #ff3742)'};
    `;
    document.body.appendChild(note);
    setTimeout(() => {
        note.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => note.remove(),300);
    },4000);
}

function shakeButton(){
    const btn = document.querySelector('.submit-btn');
    btn.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => btn.style.animation = '', 500);
}

const style = document.createElement('style');
style.textContent = `
@keyframes slideIn {
    from {transform: translateX(100%); opacity: 0;}
    to {transform: translateX(0); opacity: 1;}
}
@keyframes slideOut {
    from {transform: translateX(0); opacity: 1;}
    to {transform: translateX(100%); opacity: 0;}
}
@keyframes shake {
    0%,100% {transform: translateX(0);}
    25% {transform: translateX(-5px);}
    75% {transform: translateX(5px);}
}
`;
document.head.appendChild(style);
