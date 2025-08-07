window.onload = () => {
  const currentUser = loadUser();
  if (!currentUser) {
    window.location.href = "start.html";
    return;
  }

  showWelcome(currentUser);

  if (currentUser.layout && currentUser.layout.length > 0) {
    loadLayout(currentUser);
    loadLayout(currentUser); // For widgets
    loadNotes(currentUser);  // For notes
  }

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      window.location.href = "start.html";
    });
  }
};

 
    function addNote() {
      const container = document.getElementById('dashContainer');
      const newNote = document.createElement('div');
      newNote.className = 'dashboard';
      newNote.innerHTML = 'TO DO ITEM <span class="delete-button" onclick="this.parentElement.remove()">X</span>';
      container.appendChild(newNote);
    };
// Load the current user from localStorage
function loadUser() {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const loggedInEmail = localStorage.getItem("loggedInUser");
  return users.find(user => user.email === loggedInEmail);
}

function showWelcome(user) {
  const welcomeMsg = document.getElementById("welcome-msg");
  welcomeMsg.innerText = `Welcome, ${user.firstName}`;
}

let windowCount = 0;

// Create windows based on saved layout
function loadLayout(user) {
  const layout = user.layout || [];

  layout.forEach(win => {
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
      winEl.classList.add("pinned");
      lockWindow(winEl);
    }

    document.body.appendChild(winEl);
    makeDraggable(winEl);
    attachPinButton(winEl);
    attachDeleteButton(winEl);
  });

  if (layout.length > 0) {
    windowCount = layout.length;
  }
}

function saveLayout() {
  const currentUser = loadUser();
  if (!currentUser) return;

  const layout = [];
  const windows = document.querySelectorAll(".app-window");

  windows.forEach(win => {
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

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const userIndex = users.findIndex(u => u.email === currentUser.email);
  if (userIndex !== -1) {
    users[userIndex] = currentUser;
    localStorage.setItem("users", JSON.stringify(users));
  }

  alert("Layout saved!");
}

// Save layout button
const saveBtn = document.getElementById("save-layout-btn");
if (saveBtn) {
  saveBtn.addEventListener("click", saveLayout,saveNotes);
}

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

  makeDraggable(newWin);
  attachPinButton(newWin);
  attachDeleteButton(newWin);
});

function makeDraggable(winEl) {
  const header = winEl.querySelector(".window-header");
  if (!header) return;

  let offsetX, offsetY;

  header.onmousedown = function (e) {
    if (winEl.classList.contains("pinned")) return;

    offsetX = e.clientX - winEl.offsetLeft;
    offsetY = e.clientY - winEl.offsetTop;

    document.onmousemove = function (e) {
      winEl.style.left = e.clientX - offsetX + "px";
      winEl.style.top = e.clientY - offsetY + "px";
    };

    document.onmouseup = function () {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
}

function lockWindow(el) {
  el.style.resize = "none";
  el.style.cursor = "default";
}

function attachPinButton(winEl) {
  const pinBtn = winEl.querySelector(".window-header .pin-btn");
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
  });
}

function attachDeleteButton(winEl) {
  const deleteBtn = winEl.querySelector(".window-header .delete-btn");
  if (!deleteBtn) return;

  deleteBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this window?")) {
      winEl.remove();
    }
  });
}

function saveNotes() {
  const currentUser = loadUser();
  if (!currentUser) return;

  const notes = Array.from(document.querySelectorAll('.note')).map(note => {
    const rect = note.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      content: note.querySelector('.note-content')?.innerHTML || ""
    };
  });

  currentUser.notes = notes;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const index = users.findIndex(u => u.email === currentUser.email);
  if (index !== -1) {
    users[index] = currentUser;
    localStorage.setItem("users", JSON.stringify(users));
  }
}

function loadNotes(user) {
  (user.notes || []).forEach(note => {
    const noteEl = document.createElement("div");
    noteEl.classList.add("note");
    noteEl.style.position = "absolute";
    noteEl.style.top = note.top + "px";
    noteEl.style.left = note.left + "px";
    noteEl.style.width = note.width + "px";
    noteEl.style.height = note.height + "px";
    noteEl.innerHTML = `
      <div class="note-content" contenteditable="true">${note.content}</div>
      <span class="delete-button" onclick="this.parentElement.remove()">🗑️</span>
    `;
    document.getElementById("dashContainer").appendChild(noteEl);
  });
}

function addNote() {
  const newNote = document.createElement('div');
  newNote.className = 'note';
  newNote.style.top = '120px';
  newNote.style.left = '120px';
  newNote.style.width = '150px';
  newNote.style.height = '150px';
  newNote.innerHTML = `
    <div class="note-content" contenteditable="true">New Note</div>
    <span class="delete-button" onclick="this.parentElement.remove()">🗑️</span>
  `;
  document.body.appendChild(newNote);
  makeDraggable(newNote);
}