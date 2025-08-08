window.onload = () => {
  const currentUser = loadUser();
  if (!currentUser) {
    window.location.href = "start.html";
    return;
  }

  showWelcome(currentUser);

  // Always load both layout and notes
  loadLayout(currentUser);
  loadNotes(currentUser);

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      window.location.href = "start.html";
    });
  }
};

// ======== USER DATA HANDLING ========
function loadUser() {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const loggedInEmail = localStorage.getItem("loggedInUser");
  return users.find(user => user.email === loggedInEmail);
}

function showWelcome(user) {
  const welcomeMsg = document.getElementById("welcome-msg");
  welcomeMsg.innerText = `Welcome, ${user.firstName}`;
}

// ======== SAVE EVERYTHING IN ONE GO ========
function saveUserState() {
  const currentUser = loadUser();
  if (!currentUser) return;

  // Save layout
  const layout = [];
  document.querySelectorAll(".app-window").forEach(win => {
    const rect = win.getBoundingClientRect();
    layout.push({
      id: win.id,
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      pinned: win.classList.contains("pinned"),
      type: win.dataset.type || "App"
    });
  });
  currentUser.layout = layout;

  // Save notes
  const notes = [];
  document.querySelectorAll(".note").forEach(note => {
    const rect = note.getBoundingClientRect();
    notes.push({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      content: note.querySelector(".note-content")?.innerHTML || ""
    });
  });
  currentUser.notes = notes;

  // Write back
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const idx = users.findIndex(u => u.email === currentUser.email);
  if (idx !== -1) {
    users[idx] = currentUser;
    localStorage.setItem("users", JSON.stringify(users));
  }
}

// ======== LAYOUT LOADING ========
let windowCount = 0;

function loadLayout(user) {
  (user.layout || []).forEach(win => {
    const winEl = document.createElement("div");
    winEl.classList.add("app-window");
    winEl.id = win.id;
    winEl.style.top = win.top + "px";
    winEl.style.left = win.left + "px";
    winEl.style.width = win.width + "px";
    winEl.style.height = win.height + "px";
    winEl.style.position = "absolute";
    winEl.style.resize = win.pinned ? "none" : "both";
    winEl.dataset.type = win.type || "App";

    winEl.innerHTML = `
      <div class="window-header">
        <button class="pin-btn">${win.pinned ? "📍" : "📌"}</button>
        <button class="delete-btn">🗑️</button>
        <h3>${win.type || "App"}</h3>
      </div>
      <div class="widget-content">Loading..</div>
    `;

    if (win.pinned) {
      lockWindow(winEl);
      winEl.classList.add("pinned");
    }

    document.body.appendChild(winEl);
    makeDraggable(winEl, ".window-header");
    attachPinButton(winEl);
    attachDeleteButton(winEl);
    renderWidgetContent(winEl);
  });

  if (user.layout?.length > 0) {
    windowCount = user.layout.length;
  }
}

// ======== NOTES LOADING ========
function loadNotes(user) {
  (user.notes || []).forEach(n => {
    const note = document.createElement("div");
    note.className = "note";
    note.style.position = "absolute";
    note.style.top = n.top + "px";
    note.style.left = n.left + "px";
    note.style.width = n.width + "px";
    note.style.height = n.height + "px";

    note.innerHTML = `
      <div class="note-header">Note
        <span class="delete-button">🗑️</span>
      </div>
      <div class="note-content" contenteditable="true">${n.content || ""}</div>
    `;

    document.body.appendChild(note);
    makeDraggable(note, ".note-header"); // Draggable only
    attachDeleteButton(note);
  });
}

// ======== BUTTON ACTIONS ========
document.getElementById("new-window-btn").addEventListener("click", () => {
  createWidget();   // picks Weather or Calendar, builds it, renders content
  windowCount++;    // optional counter update
});

document.querySelector(".new-button").addEventListener("click", addNote);

function addNote() {
  const note = document.createElement("div");
  note.className = "note";
  note.style.top = "120px";
  note.style.left = "120px";
  note.style.width = "180px";
  note.style.height = "150px";

  note.innerHTML = `
    <div class="note-header">Note
      <span class="delete-button">🗑️</span>
    </div>
    <div class="note-content" contenteditable="true">New Note</div>
  `;

  document.body.appendChild(note);
  makeDraggable(note, ".note-header");
  attachDeleteButton(note);
  saveUserState();
}

// ======== DRAGGING ========
function makeDraggable(el, handleSelector) {
  const handle = handleSelector ? el.querySelector(handleSelector) : el;
  if (!handle) return;

  let offsetX, offsetY;

  handle.onmousedown = function (e) {
    if (e.target.closest(".note-content")) return; // Don't drag from inside editable text
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;

      if (!window.__topZ) window.__topZ = 1000;
    window.__topZ = Math.min(window.__topZ + 1, 99997);
    el.style.zIndex = window.__topZ;

    document.onmousemove = function (e) {
      el.style.left = e.clientX - offsetX + "px";
      el.style.top = e.clientY - offsetY + "px";
    };

    document.onmouseup = function () {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
}

// ======== PIN / DELETE ========
function lockWindow(el) {
  el.style.resize = "none";
  el.style.cursor = "default";
}

function attachPinButton(winEl) {
  const pinBtn = winEl.querySelector(".pin-btn");
  if (!pinBtn) return;

  pinBtn.addEventListener("click", () => {
    winEl.classList.toggle("pinned");

    if (winEl.classList.contains("pinned")) {
      lockWindow(winEl);
      pinBtn.innerText = "📍";
    } else {
      winEl.style.resize = "both";
      winEl.style.cursor = "move";
      pinBtn.innerText = "📌";
    }
    saveUserState();
  });
}

function attachDeleteButton(el) {
  const deleteBtn = el.querySelector(".delete-btn, .delete-button");
  if (!deleteBtn) return;

  deleteBtn.addEventListener("click", () => {
    const type = el.classList.contains("note") ? "note" : "window";
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      el.remove();
      saveUserState();
    }
  });
}

function createWidget() {
  const type = prompt("Enter widget type (Weather or Calendar):");
  if (!type || !["Weather","Calendar"].includes(type)) {
    alert("Please type exactly: Weather or Calendar");
    return;
  }

  const widget = document.createElement("div");
  widget.className = "app-window";
  widget.id = `window-${Date.now()}`;
  widget.style.top = "100px";
  widget.style.left = "100px";
  widget.style.width = "220px";
  widget.style.height = "160px";
  widget.style.position = "absolute";
  widget.dataset.type = type; // 👈 store widget type on the element

  widget.innerHTML = `
    <div class="window-header">
      <button class="pin-btn">📌</button>
      <button class="delete-btn">🗑️</button>
      <h3>${type} Widget</h3>
    </div>
    <div class="widget-content">Loading ${type}...</div>
  `;

  document.body.appendChild(widget);

  makeDraggable(widget, ".window-header");
  attachPinButton(widget);
  attachDeleteButton(widget);

  // Populate content
  renderWidgetContent(widget);

  // Persist right away
  saveUserState();
}

function renderWidgetContent(winEl) {
  const type = winEl.dataset.type;
  const target = winEl.querySelector(".widget-content");
  if (!target) return;

  if (type === "Weather") {
    fetchMockWeather().then(data => {
      target.innerHTML = `
        <div><strong>${data.location}</strong></div>
        <div>${data.temperature}, ${data.condition}</div>
      `;
    });
  } else if (type === "Calendar") {
    fetchMockCalendar().then(events => {
      target.innerHTML = `
        <div><strong>${new Date().toDateString()}</strong></div>
        <ul style="margin:6px 0 0 16px;">
          ${events.map(e => `<li>${e.time} — ${e.title}</li>`).join("")}
        </ul>
      `;
    });
  } else {
    target.textContent = "Unknown widget";
  }
}

function fetchMockWeather() {
  return new Promise(res => {
    setTimeout(() => {
      res({ location: "Dallas, TX", temperature: "84°F", condition: "Sunny" });
    }, 500);
  });
}

function fetchMockCalendar() {
  return new Promise(res => {
    setTimeout(() => {
      res([
        { time: "9:00 AM",  title: "Team Standup" },
        { time: "1:30 PM",  title: "Client Sync" }
      ]);
    }, 500);
  });
}

