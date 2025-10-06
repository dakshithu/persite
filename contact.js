// ========== DARK MODE ==========
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
window.addEventListener('storage', applyDarkModeSetting);

// ========== ANIMATIONS ==========
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Special handling for contact methods
                if (entry.target.classList.contains('contact-info')) {
                    const methods = entry.target.querySelectorAll('.contact-method');
                    const socialLinks = entry.target.querySelector('.social-links');
                    
                    methods.forEach((method, index) => {
                        setTimeout(() => method.classList.add('animate'), index * 150);
                    });
                    
                    setTimeout(() => {
                        if (socialLinks) socialLinks.classList.add('animate');
                    }, methods.length * 150 + 200);
                }
                
                // Special handling for form
                if (entry.target.classList.contains('contact-form')) {
                    const formGroups = entry.target.querySelectorAll('.form-group');
                    const submitButton = entry.target.querySelector('.submit-btn');
                    
                    setTimeout(() => {
                        formGroups.forEach((group, index) => {
                            setTimeout(() => group.classList.add('animate'), index * 100);
                        });
                        
                        setTimeout(() => {
                            if (submitButton) submitButton.classList.add('animate');
                        }, formGroups.length * 100 + 200);
                    }, 200);
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.animate-on-scroll').forEach(section => observer.observe(section));
});

// ========== DYNAMIC AVAILABILITY ===========
document.addEventListener('DOMContentLoaded', function() {
    const statusElement = document.getElementById('availability-status');
    const detailsElement = document.getElementById('availability-details');
    
    fetch('./data/availability.json')
        .then(response => {
            if (!response.ok) throw new Error("not found");
            return response.json();
        })
        .then(data => {
            const statusText = data.available ? 'Available for new projects' : 'Not available for new projects';
            const statusColor = data.available ? '#22d685' : '#ff4757';
            
            statusElement.innerHTML = `
                <span class="status-dot" style="background: ${statusColor}; box-shadow: 0 0 5px ${statusColor};"></span>
                <span style="color: ${statusColor};">${statusText}</span>
            `;
            
            detailsElement.innerHTML = `
                <p><strong>Best time to reach:</strong> ${data.time}</p>
                <p><strong>Response time:</strong> ${data.responseTime || 'Usually within 24 hours'}</p>
            `;
        })
        .catch(error => {
            statusElement.innerHTML = `
                <span class="status-dot"></span>
                <span style="color: #22d685;">Available for new projects</span>
            `;
            detailsElement.innerHTML = `
                <p><strong>Best time to reach:</strong> 9 AM - 6 PM (GMT+4)</p>
                <p><strong>Response time:</strong> Usually within 24 hours</p>
            `;
        });
});

// ========== FORM ENHANCEMENT ===========
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const submitBtn = form.querySelector('.submit-btn');
    
    form.addEventListener('submit', function(e) {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !message) {
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

    // Input animations
    form.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
});

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px;
        border-radius: 12px; color: white; font-weight: 500; z-index: 1000;
        animation: slideIn 0.3s ease; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        ${type === 'success' ? 'background: linear-gradient(135deg, #22d685, #0066ff);' : 'background: linear-gradient(135deg, #ff4757, #ff3742);'}
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
}

function shakeButton() {
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => submitBtn.style.animation = '', 500);
}

// Add animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);
