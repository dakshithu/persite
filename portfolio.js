"use strict";
const $ = (selector) => document.querySelector(selector);
const safeURL = (value) => {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};
function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}
async function readData(name) {
  const response = await fetch(`data/${name}.json`);
  if (!response.ok) throw new Error("Data unavailable");
  return response.json();
}
const theme = $("#theme");
try {
  if (localStorage.getItem("dakshith_theme") === "dark")
    document.documentElement.dataset.theme = "dark";
} catch {}
function syncTheme() {
  const dark = document.documentElement.dataset.theme === "dark";
  theme.textContent = dark ? "Light mode" : "Dark mode";
  theme.setAttribute(
    "aria-label",
    `Switch to ${dark ? "light" : "dark"} theme`,
  );
}
if (theme) {
  syncTheme();
  theme.addEventListener("click", () => {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("dakshith_theme", next);
    } catch {}
    syncTheme();
  });
}
function tick() {
  if ($("#clock"))
    $("#clock").textContent = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Dubai",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
}
tick();
setInterval(tick, 60000);
if ($("#year")) $("#year").textContent = new Date().getFullYear();

const awardStack = $("#awardStack");
if (awardStack) {
  const awardPhotos = [...awardStack.querySelectorAll(".instant-photo")];
  const awardButtons = [...document.querySelectorAll("[data-deck-direction]")];
  const awardPosition = $("#awardPosition");
  const awardAnnouncement = $("#awardAnnouncement");
  let awardOrder = [...awardPhotos];
  let awardMoving = false;

  const renderAwardStack = () => {
    awardOrder.forEach((photo, index) => {
      photo.dataset.deckPosition = String(index);
      photo.setAttribute("aria-hidden", index === 0 ? "false" : "true");
    });
    if (awardPosition) {
      awardPosition.textContent = String(awardPhotos.indexOf(awardOrder[0]) + 1);
    }
  };

  const cycleAward = (direction) => {
    if (awardMoving) return;
    awardMoving = true;
    awardButtons.forEach((button) => (button.disabled = true));
    const topPhoto = awardOrder[0];
    topPhoto.classList.add(`is-exiting-${direction}`);

    window.setTimeout(() => {
      awardOrder = [...awardOrder.slice(1), topPhoto];
      topPhoto.classList.remove(`is-exiting-${direction}`);
      renderAwardStack();
      if (awardAnnouncement) {
        awardAnnouncement.textContent = `Showing ${awardOrder[0].dataset.award}`;
      }
      window.setTimeout(() => {
        awardMoving = false;
        awardButtons.forEach((button) => (button.disabled = false));
      }, 520);
    }, 260);
  };

  awardButtons.forEach((button) => {
    button.addEventListener("click", () => cycleAward(button.dataset.deckDirection));
  });
  renderAwardStack();
}

const categories = {
  Vestiga: "WEB APPLICATION",
  Chess: "BROWSER GAME",
  "Games App": "ARCADE / PUZZLES",
  "To-do List": "PRODUCTIVITY",
  DigiClock: "WEB UTILITY",
  SimpleCalculator: "WEB UTILITY",
  "Sustainable Living Info": "INFORMATION",
  "MealMate (Android App)": "ANDROID",
  "Pre KG Learning": "EDUCATION",
  "Brain Wizard": "LEARNING GAME",
};
if ($("#project-list"))
  readData("projects")
    .then((projects) => {
      if (!Array.isArray(projects)) throw new Error("Invalid projects");
      const list = $("#project-list");
      list.replaceChildren();
      const ordered = [...projects].sort((a, b) =>
        a.title === "Vestiga" ? -1 : b.title === "Vestiga" ? 1 : 0,
      );
      $("#project-count").textContent =
        `${String(ordered.length).padStart(2, "0")} PROJECTS`;
      if (!ordered.length)
        list.append(el("p", "New projects will appear here."));
      ordered.forEach((project, index) => {
        const inactive = /not running/i.test(project.title);
        const url = safeURL(project.url);
        const row = el(url && !inactive ? "a" : "div", "", "project-row");
        if (url && !inactive) {
          row.href = url;
          row.target = "_blank";
          row.rel = "noopener noreferrer";
        }
        row.append(
          el("span", String(index + 1).padStart(2, "0"), "number mono"),
          el("h3", project.title),
          el(
            "span",
            inactive ? "OFFLINE" : categories[project.title] || "EXPERIMENT",
            "category mono",
          ),
          el("span", inactive ? "—" : "↗"),
        );
        list.append(row);
      });
    })
    .catch(() => {
      $("#project-list").replaceChildren(
        el(
          "p",
          "The project index couldn’t load. Refresh to try again, or explore my GitHub below.",
        ),
      );
    });
for (const name of ["education", "experience"]) {
  const target = $(`#${name}-list`);
  if (!target) continue;
  readData(name)
    .then((items) => {
      if (!Array.isArray(items)) throw new Error("Invalid entries");
      target.replaceChildren();
      if (!items.length) target.append(el("p", "No entries added yet."));
      items.forEach((item) => {
        const entry = el("article", "", "timeline-entry");
        entry.append(el("span", item.dates || item.details, "mono"));
        const heading = el("h4");
        const url = safeURL(item.url);
        if (url) {
          const link = el("a", item.name + " ↗");
          link.href = url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          heading.append(link);
        } else heading.textContent = item.name || item.role;
        entry.append(heading);
        if (item.org) entry.append(el("p", item.org));
        if (item.description) entry.append(el("p", item.description));
        target.append(entry);
      });
    })
    .catch(() => {
      target.textContent = `The ${name} entries couldn’t load. Please refresh to try again.`;
    });
}
readData("availability")
  .then((data) => {
    if ($("#availability"))
      $("#availability").textContent = data.available
        ? "Open to projects & collaborations"
        : "Currently focused on ongoing projects";
    if ($("#availability-details"))
      $("#availability-details").textContent =
        `${data.time || ""} · ${data.responseTime || ""}`;
  })
  .catch(() => {
    if ($("#availability"))
      $("#availability").textContent = "Get in touch for availability";
  });
let email = "hello@dakshithu.de5.net";
readData("contact")
  .then((data) => {
    if (
      typeof data.email === "string" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
    )
      email = data.email;
    document.querySelectorAll("[data-email]").forEach((link) => {
      link.href = `mailto:${email}`;
      link.textContent = `${email} ↗`;
    });
    for (const type of ["github", "linkedin"]) {
      const url = safeURL(data[type]);
      if (url)
        document
          .querySelectorAll(`[data-${type}]`)
          .forEach((link) => (link.href = url));
    }
  })
  .catch(() => {});
if ($("#contactForm"))
  $("#contactForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $("#name").value.trim();
    const message = $("#message").value.trim();
    if (!name || !message) {
      $("#form-status").textContent =
        "Please enter your name and a message, not just spaces.";
      return;
    }
    const body = `${message}\n\nFrom: ${name}\nReply to: ${$("#email").value.trim()}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(`Portfolio enquiry from ${name}`)}&body=${encodeURIComponent(body)}`;
    $("#form-status").textContent =
      "Your email app has been requested. Send the draft there to deliver your message. If it does not open, use the email link on this page.";
  });

if ($("#about-text"))
  fetch("data/about.txt")
    .then((response) => {
      if (!response.ok) throw new Error("About unavailable");
      return response.text();
    })
    .then((text) => {
      if (text.trim()) $("#about-text").textContent = text.trim();
    })
    .catch(() => {});
