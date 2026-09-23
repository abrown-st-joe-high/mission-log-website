/* CS Mission Log
 * Storage keys (all prefixed so export/import only touches this app):
 *   cslog:profile           -> { first, last, code, savedAt }
 *   cslog:mission:<id>      -> { fields: {inputId: value}, progress: {...}, savedAt }
 *
 * TO ADD A NEW MISSION PAGE:
 *   1. Copy AppInventor_Part_I.html, rename it, and change data-mission to a unique id.
 *   2. Give every checkbox, date, text input, or textarea data-save and a unique id.
 *   3. Add one entry to the MISSIONS list below so it shows on the home page.
 */

const MISSIONS = [
  {
    id: "AppInventor_Part_I",
    title: "AppInventor Part I",
    href: "AppInventor_Part_I.html",
    blurb: "MyFirstApp, a custom app, and the SimpleDrawingApps series."
  }
  // { id: "AppInventor_Part_II", title: "AppInventor Part II", href: "AppInventor_Part_II.html", blurb: "..." },
];

const PREFIX = "cslog:";
const PROFILE_KEY = PREFIX + "profile";
const missionKey = (id) => PREFIX + "mission:" + id;

/* ---------- storage helpers ---------- */
function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    return false;
  }
}

function getProfile() {
  return readJSON(PROFILE_KEY) || { first: "", last: "", code: "" };
}

function flash(el, message, warn) {
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("warn", !!warn);
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.textContent = ""; }, 4000);
}

function updateChip() {
  const chip = document.getElementById("cadetChip");
  if (!chip) return;
  const p = getProfile();
  const name = [p.first, p.last].filter(Boolean).join(" ");
  chip.textContent = name ? name + (p.code ? "  |  Code " + p.code : "") : "No cadet saved";
}

/* ---------- home page ---------- */
function initHome() {
  const form = document.getElementById("profileForm");
  const first = document.getElementById("firstName");
  const last = document.getElementById("lastName");
  const code = document.getElementById("instructorCode");
  const status = document.getElementById("profileStatus");

  const p = getProfile();
  first.value = p.first || "";
  last.value = p.last || "";
  code.value = p.code || "";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = writeJSON(PROFILE_KEY, {
      first: first.value.trim(),
      last: last.value.trim(),
      code: code.value.trim(),
      savedAt: new Date().toISOString()
    });
    updateChip();
    flash(status, ok ? "Saved." : "Could not save. Browser storage may be blocked.", !ok);
  });

  renderMissions();
  initBackup();
}

function renderMissions() {
  const grid = document.getElementById("missionGrid");
  if (!grid) return;
  grid.innerHTML = "";

  MISSIONS.forEach((m) => {
    const saved = readJSON(missionKey(m.id));
    const pr = (saved && saved.progress) || { cadetDone: 0, cadetTotal: 0, controlDone: 0, controlTotal: 0 };
    const pct = pr.cadetTotal ? Math.round((pr.cadetDone / pr.cadetTotal) * 100) : 0;

    const a = document.createElement("a");
    a.className = "mission-card";
    a.href = m.href;

    const h = document.createElement("h3");
    h.textContent = m.title;
    const p = document.createElement("p");
    p.textContent = m.blurb;

    const meter = document.createElement("div");
    meter.className = "meter";
    const bar = document.createElement("i");
    bar.style.width = pct + "%";
    meter.appendChild(bar);

    const label = document.createElement("span");
    label.className = "meter-label";
    label.textContent = saved
      ? pr.cadetDone + " of " + pr.cadetTotal + " complete, " + pr.controlDone + " verified"
      : "Not started";

    a.append(h, p, meter, label);
    grid.appendChild(a);
  });
}

/* ---------- backup: export / import ---------- */
function collectAll() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) {
      try { data[key] = JSON.parse(localStorage.getItem(key)); }
      catch (e) { data[key] = localStorage.getItem(key); }
    }
  }
  return data;
}

function initBackup() {
  const status = document.getElementById("backupStatus");

  document.getElementById("exportBtn").addEventListener("click", () => {
    const payload = {
      app: "CS Mission Log",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: collectAll()
    };
    const p = getProfile();
    const who = [p.last, p.first].filter(Boolean).join("_") || "cadet";
    const stamp = new Date().toISOString().slice(0, 10);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CS_Mission_Log_" + who + "_" + stamp + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    flash(status, "Backup downloaded.");
  });

  document.getElementById("importFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || parsed.app !== "CS Mission Log" || typeof parsed.data !== "object") {
          throw new Error("Not a CS Mission Log backup");
        }
        let count = 0;
        Object.keys(parsed.data).forEach((key) => {
          if (key.startsWith(PREFIX)) {
            localStorage.setItem(key, JSON.stringify(parsed.data[key]));
            count++;
          }
        });
        initHomeFieldsFromStorage();
        renderMissions();
        updateChip();
        flash(status, "Restored " + count + " saved item" + (count === 1 ? "" : "s") + ".");
      } catch (err) {
        flash(status, "That file is not a valid backup.", true);
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  });
}

function initHomeFieldsFromStorage() {
  const p = getProfile();
  document.getElementById("firstName").value = p.first || "";
  document.getElementById("lastName").value = p.last || "";
  document.getElementById("instructorCode").value = p.code || "";
}

/* ---------- mission (checklist) pages ---------- */
function initMission() {
  const id = document.body.dataset.mission;
  const key = missionKey(id);
  const inputs = Array.from(document.querySelectorAll("[data-save]"));
  const status = document.getElementById("saveStatus");
  const profile = getProfile();

  // Fill in the cadet name for the "Titled LastnameFirstname..." line
  const nameJoined = (profile.last + profile.first).replace(/\s+/g, "");
  document.querySelectorAll('[data-fill="name"]').forEach((el) => {
    el.textContent = nameJoined || "LastnameFirstname";
  });

  // Mission control unlocks with a saved instructor code
  const unlocked = !!profile.code;
  document.querySelectorAll("[data-control]").forEach((el) => { el.disabled = !unlocked; });
  const notice = document.getElementById("codeNotice");
  if (notice) notice.hidden = unlocked;

  // Restore saved state
  const saved = readJSON(key);
  if (saved && saved.fields) {
    inputs.forEach((el) => {
      if (!(el.id in saved.fields)) return;
      if (el.type === "checkbox") el.checked = !!saved.fields[el.id];
      else el.value = saved.fields[el.id];
    });
  }

  function progress() {
    const cadet = document.querySelectorAll("[data-cadet]");
    const control = document.querySelectorAll("[data-control]");
    return {
      cadetDone: Array.from(cadet).filter((c) => c.checked).length,
      cadetTotal: cadet.length,
      controlDone: Array.from(control).filter((c) => c.checked).length,
      controlTotal: control.length
    };
  }

  function paintProgress() {
    const pr = progress();
    const set = (meter, count, done, total, word) => {
      document.getElementById(meter).style.width = (total ? (done / total) * 100 : 0) + "%";
      document.getElementById(count).textContent = done + " of " + total + " " + word;
    };
    set("cadetMeter", "cadetCount", pr.cadetDone, pr.cadetTotal, "complete");
    set("controlMeter", "controlCount", pr.controlDone, pr.controlTotal, "verified");
    return pr;
  }

  function save(message) {
    const fields = {};
    inputs.forEach((el) => {
      fields[el.id] = el.type === "checkbox" ? el.checked : el.value;
    });
    const ok = writeJSON(key, {
      fields,
      progress: paintProgress(),
      savedAt: new Date().toISOString()
    });
    flash(status, ok ? message : "Could not save. Browser storage may be blocked.", !ok);
  }

  paintProgress();

  // Autosave on every change (text is debounced), plus an explicit Save button
  let timer;
  inputs.forEach((el) => {
    const isText = el.type === "text" || el.tagName === "TEXTAREA";
    el.addEventListener(isText ? "input" : "change", () => {
      clearTimeout(timer);
      timer = setTimeout(() => save("Saved."), isText ? 500 : 0);
      paintProgress();
    });
  });

  document.getElementById("saveBtn").addEventListener("click", () => save("Saved."));
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  updateChip();
  const page = document.body.dataset.page;
  if (page === "home") initHome();
  if (page === "mission") initMission();
});
