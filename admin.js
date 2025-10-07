// Helper: fetch JSON
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed: ${url}`);
  return await res.json();
}

// Helper: post JSON (for actual server, use AJAX/endpoint; here, use localStorage for demo)
function saveJSON(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function loadJSON(key, fallback) {
  const v = localStorage.getItem(key);
  if (v) try { return JSON.parse(v); } catch { return fallback; }
  return fallback;
}

// --- Experience (dynamic CRUD in form) ---
document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('experience-form');
  const btnAdd = document.getElementById('add-experience');
  let experiences = loadJSON('exp', [
    { dates: '2024–Present', role: 'Outlier (Freelance)' },
    { dates: '2023–2024', role: 'Python Developer, Freelance' }
  ]);

  function render() {
    form.innerHTML = '';
    experiences.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'input-group mb-2';
      row.innerHTML = `
        <input class="form-control" type="text" value="${item.dates}" placeholder="Dates" id="exp-dates-${i}">
        <input class="form-control" type="text" value="${item.role}" placeholder="Role" id="exp-role-${i}">
        <button class="btn btn-danger" type="button" id="del-exp-${i}">&times;</button>
      `;
      form.appendChild(row);
      row.querySelector(`#del-exp-${i}`).onclick = () => {
        experiences.splice(i, 1); saveJSON('exp', experiences); render();
      };
      row.querySelector(`#exp-dates-${i}`).onchange = e=> { experiences[i].dates = e.target.value; saveJSON('exp', experiences);}
      row.querySelector(`#exp-role-${i}`).onchange = e=> { experiences[i].role = e.target.value; saveJSON('exp', experiences);}
    });
  }
  render();

  btnAdd.onclick = () => {
    experiences.push({ dates: '', role: '' }); saveJSON('exp', experiences); render();
  };
});

// --- Education/Contact/Projects/Availability: same pattern as above using their respective keys and fields.
