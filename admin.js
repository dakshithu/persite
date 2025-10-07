// ----- Helper functions -----
function store(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function load(key, fallback=[]) {
  const raw = localStorage.getItem(key);
  try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

// ----- Experience -----
function renderExperience() {
  const exp = load('admin-experience', [
    { dates: "2024–Present", role: "Outlier (Freelance)" },
    { dates: "2023–2024", role: "Python Developer, Freelance" }
  ]);
  const form = document.getElementById('admin-experience'); if(!form) return;
  form.innerHTML = '';
  exp.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'input-group mb-2';
    row.innerHTML = `
      <input type="text" class="form-control" value="${item.dates}" placeholder="Dates">
      <input type="text" class="form-control" value="${item.role}" placeholder="Role">
      <button class="btn btn-danger" type="button">&times;</button>
    `;
    row.querySelector('.form-control').onchange = e => { exp[i].dates = e.target.value; store('admin-experience', exp); renderExperience(); };
    row.querySelectorAll('.form-control')[1].onchange = e => { exp[i].role = e.target.value; store('admin-experience', exp); renderExperience(); };
    row.querySelector('.btn-danger').onclick = () => { exp.splice(i, 1); store('admin-experience', exp); renderExperience(); };
    form.appendChild(row);
  });
  const addBtn = document.createElement('button');
  addBtn.className = 'btn btn-success mt-2 btn-sm';
  addBtn.type = 'button';
  addBtn.textContent = 'Add Experience';
  addBtn.onclick = () => { exp.push({ dates: '', role: '' }); store('admin-experience', exp); renderExperience(); };
  form.appendChild(addBtn);
}
document.addEventListener('DOMContentLoaded', renderExperience);

// ----- Education -----
function renderEducation() {
  const edu = load('admin-education', [
    { name: "ASPAM IIS", url: "https://aspamiis.com/", details: "Expected 2031" },
    { name: "Zero to Mastery", url: "https://zerotomastery.io/", details: "" },
    { name: "The App Brewery", url: "https://appbrewery.com", details: "" }
  ]);
  const form = document.getElementById('admin-education'); if(!form) return;
  form.innerHTML = '';
  edu.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'input-group mb-2';
    row.innerHTML = `
      <input type="text" class="form-control" value="${item.name}" placeholder="School/Institute">
      <input type="url" class="form-control" value="${item.url}" placeholder="URL">
      <input type="text" class="form-control" value="${item.details}" placeholder="Details">
      <button class="btn btn-danger" type="button">&times;</button>
    `;
    row.querySelector('.form-control').onchange = e => { edu[i].name = e.target.value; store('admin-education', edu); renderEducation(); };
    row.querySelectorAll('.form-control')[1].onchange = e => { edu[i].url = e.target.value; store('admin-education', edu); renderEducation(); };
    row.querySelectorAll('.form-control')[2].onchange = e => { edu[i].details = e.target.value; store('admin-education', edu); renderEducation(); };
    row.querySelector('.btn-danger').onclick = () => { edu.splice(i, 1); store('admin-education', edu); renderEducation(); };
    form.appendChild(row);
  });
  const addBtn = document.createElement('button');
  addBtn.className = 'btn btn-success mt-2 btn-sm';
  addBtn.type = 'button';
  addBtn.textContent = 'Add Education';
  addBtn.onclick = () => { edu.push({ name: '', url: '', details: '' }); store('admin-education', edu); renderEducation(); };
  form.appendChild(addBtn);
}
document.addEventListener('DOMContentLoaded', renderEducation);

// ----- Contact Info -----
function renderContact() {
  const contact = load('admin-contact', { email:'', phone:'', linkedin:'', github:'' });
  const form = document.getElementById('admin-contact'); if(!form) return;
  form.innerHTML = `
    <div class="mb-2">
      <input type="email" class="form-control" value="${contact.email}" placeholder="Email"
        onchange="localStorage.setItem('admin-contact', JSON.stringify({...JSON.parse(localStorage.getItem('admin-contact')||'{}'), email: this.value})); renderContact();">
    </div>
    <div class="mb-2">
      <input type="tel" class="form-control" value="${contact.phone}" placeholder="Phone"
        onchange="localStorage.setItem('admin-contact', JSON.stringify({...JSON.parse(localStorage.getItem('admin-contact')||'{}'), phone: this.value})); renderContact();">
    </div>
    <div class="mb-2">
      <input type="url" class="form-control" value="${contact.linkedin}" placeholder="LinkedIn URL"
        onchange="localStorage.setItem('admin-contact', JSON.stringify({...JSON.parse(localStorage.getItem('admin-contact')||'{}'), linkedin: this.value})); renderContact();">
    </div>
    <div class="mb-2">
      <input type="url" class="form-control" value="${contact.github}" placeholder="GitHub URL"
        onchange="localStorage.setItem('admin-contact', JSON.stringify({...JSON.parse(localStorage.getItem('admin-contact')||'{}'), github: this.value})); renderContact();">
    </div>
  `;
}
window.renderContact = renderContact; // Called as inline event
document.addEventListener('DOMContentLoaded', renderContact);

// Repeat same pattern for projects and availability if desired

