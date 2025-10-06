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

// ========== SCROLL ANIMATIONS (FIXED) ==========
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Special handling for contact methods with stagger effect
                if (entry.target.classList.contains('contact-info')) {
                    const methods = entry.target.querySelectorAll('.contact-method');
                    const socialLinks = entry.target.querySelector('.social-links');
                    
                    methods.forEach((method, index) => {
                        setTimeout(() => {
                            method.classList.add('animate');
                        }, index * 150);
                    });
                    
                    setTimeout(() => {
                        if (socialLinks) {
                            socialLinks.classList.add('animate');
                        }
                    }, methods.length * 150 + 200);
                }
                
                // Special handling for form groups with stagger effect
                if (entry.target.classList.contains('contact-form')) {
                    const formGroups = entry.target.querySelectorAll('.form-group');
                    const submitButton = entry.target.querySelector('.submit-btn');
                    
                    setTimeout(() => {
                        formGroups.forEach((group, index) => {
                            setTimeout(() => {
                                group.classList.add('animate');
                            }, index * 100);
                        });
                        
                        setTimeout(() => {
                            if (submitButton) {
                                submitButton.classList.add('animate');
                            }
                        }, formGroups.length * 100 + 200);
                    }, 200);
                }
                
                // Unobserve after animation to prevent re-triggering
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate on scroll
    const elementsToObserve = [
        '.contact-info',
        '.contact-form',
        '.availability'
    ];
    
    elementsToObserve.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => observer.observe(el));
    });
});

// ========== DYNAMIC AVAILABILITY ===========
document.addEventListener('DOMContentLoaded', function() {
    const statusElement = document.getElementById('availability-status');
    const detailsElement = document.getElementById('availability-details');
    
    const defaultAvailability = {
        available: true,
        time: "9 AM - 6 PM (GMT+4)",
        responseTime: "Usually within 24 hours"
    };

    fetch('./data/availability.json')
        .then(response => {
            if (!response.ok) throw new Error("not found");
            return response.json();
        })
        .then(data => {
            const statusText = data.available ? 'Available for new projects' : 'Not available for new projects';
            const statusColor = data.available ? '#22d685' : '#ff4757';
            
            statusElement.innerHTML = `
                <span class="status-dot" style="background: ${statusColor}; box-shadow: 0 0 10px ${statusColor};"></span>
                <span class="available" style="color: ${statusColor};">${statusText}</span>
            `;
            
            detailsElement.innerHTML = `
                <p><strong>Best time to reach:</strong> ${data.time}</p>
                <p><strong>Response time:</strong> ${data.responseTime || 'Usually within 24 hours'}</p>
            `;
        })
        .catch(error => {
            // Fallback to defaults
            statusElement.innerHTML = `
                <span class="status-dot"></span>
                <span class="available">Available for new projects</span>
            `;
            detailsElement.innerHTML = `
                <p><strong>Best time to reach:</strong> ${defaultAvailability.time}</p>
                <p><strong>Response time:</strong> ${defaultAvailability.responseTime}</p>
            `;
        });
});

// ========== FORM ENHANCEMENT ===========
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const submitBtn = form ? form.querySelector('.submit-btn') : null;
    
    if (form && submitBtn) {
        form.addEventListener('submit', function(e) {
            const name = form.querySelector('#name') ? form.querySelector('#name').value.trim() : '';
            const email = form.querySelector('#email') ? form.querySelector('#email').value.trim() : '';
            const message = form.querySelector('#message') ? form.querySelector('#message').value.trim() : '';
            
            if (!name || !email || !message) {
                e.preventDefault();
                showNotification('Please fill in all required fields', 'error');
                shakeButton();
                return;
            }
            
            // Show loading state
            submitBtn.classList.add('loading');
            submitBtn.textContent = 'Sending...';
            
            // Reset button after a delay
            setTimeout(() => {
                submitBtn.classList.remove('loading');
                submitBtn.textContent = 'Send Message';
                showNotification('Message prepared! Your email client should open.', 'success');
            }, 2000);
        });
    }
    
    // Enhanced input animations
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (this.parentElement) {
                this.parentElement.style.transform = 'translateY(-2px)';
            }
            this.style.boxShadow = '0 8px 25px rgba(0, 102, 255, 0.15)';
        });
        
        input.addEventListener('blur', function() {
            if (this.parentElement) {
                this.parentElement.style.transform = 'translateY(0)';
            }
            this.style.boxShadow = 'none';
        });
        
        // Floating label effect
        input.addEventListener('input', function() {
            if (this.value) {
                this.classList.add('has-content');
            } else {
                this.classList.remove('has-content');
            }
        });
    });
});

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        ${type === 'success' ? 'background: linear-gradient(135deg, var(--accent), var(--highlight));' : 'background: linear-gradient(135deg, #ff4757, #ff3742);'}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function shakeButton() {
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            submitBtn.style.animation = '';
        }, 500);
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .form-group input.has-content,
    .form-group textarea.has-content {
        border-color: var(--accent);
    }
`;
document.head.appendChild(style);
