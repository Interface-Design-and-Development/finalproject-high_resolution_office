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
      pinned: win.classList.contains("pinned")
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

    winEl.innerHTML = `
      <div class="window-header">
        <button class="pin-btn">${win.pinned ? "📍" : "📌"}</button>
        <button class="delete-btn">🗑️</button>
        <h3>${win.id}</h3>
      </div>
    `;

    if (win.pinned) {
      lockWindow(winEl);
      winEl.classList.add("pinned");
    }

    document.body.appendChild(winEl);
    makeDraggable(winEl, ".window-header");
    attachPinButton(winEl);
    attachDeleteButton(winEl);
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
document.getElementById("save-layout-btn").addEventListener("click", saveUserState);

document.getElementById("new-window-btn").addEventListener("click", () => {
  windowCount++;
  const newWin = document.createElement("div");
  newWin.classList.add("app-window");
  newWin.id = `window-${windowCount}`;
  newWin.style.top = "100px";
  newWin.style.left = "100px";
  newWin.style.width = "200px";
  newWin.style.height = "150px";
  newWin.style.position = "absolute";
  newWin.style.resize = "both";

  newWin.innerHTML = `
    <div class="window-header">
      <button class="pin-btn">📌</button>
      <button class="delete-btn">🗑️</button>
      <h3>${newWin.id}</h3>
    </div>
    <p>Window content here</p>
  `;

  document.body.appendChild(newWin);
  makeDraggable(newWin, ".window-header");
  attachPinButton(newWin);
  attachDeleteButton(newWin);
  saveUserState();
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
