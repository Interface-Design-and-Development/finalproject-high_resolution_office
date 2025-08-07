let windowCount = 0; // or however many static windows we have

window.onload = () => {
    const currentUser = loadUser();
    if(!currentUser) {
        window.location.href = "start.html";
        return;
    }
    showWelcome(currentUser);

    if(currentUser.layout && currentUser.layout.length > 0){
    loadLayout(currentUser);
    }
    const logoutBtn = document.getElementById("logout-btn");
        if(logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                localStorage.removeItem("loggedInUser");
                window.location.href="start.html";
        });
    }
};

//This loads this current user to call for saved item
   function loadUser() {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const loggedInEmail = localStorage.getItem("loggedInUser");
        return users.find(user => user.email === loggedInEmail);
    };

    function showWelcome(user){
        const welcomeMsg = document.getElementById("welcome-msg");
        welcomeMsg.innerText = `Welcome, ${user.firstName}`;
    };

        //This loads the saved layout for the current user
function loadLayout(user) {
  const layout = user.layout || [];

  layout.forEach((win, index) => {
    const winEl = document.createElement("div");
    winEl.classList.add("app-window");
    winEl.id = win.id;
    winEl.style.top = win.top + "px";
    winEl.style.left = win.left + "px";
    winEl.style.width = win.width + "px";
    winEl.style.height = win.height + "px";
    winEl.style.position = "absolute";
    winEl.style.resize = win.pinned ? "none" : "both";

    winEl.innerHTML = 
    <div class ="window-header">
      <button class="pin-btn">${win.pinned ? "📍" : "📌"}</button>
      <button class="delete-btn">🗑️</button>
      <h3>${win.id}</h3>
    </div>
    ;
    
    if (win.pinned) {
      winEl.classList.add("pinned");
      lockWindow(winEl);
    }

    document.body.appendChild(winEl);
    makeDraggable(winEl);
    attachPinButton(winEl);
    attachDeleteButton(winEl);
  });

  // Update windowCount to reflect total windows
    windowCount = layout.length;
}


//This saves the layout for the user's session
function saveLayout() {
  const currentUser = loadUser();
  if (!currentUser) return;

  const layout = [];
  const windows = document.querySelectorAll(".app-window");

  windows.forEach((win) => {
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


// Attach save layout button
const saveBtn = document.getElementById("save-layout-btn");
if (saveBtn) {
  saveBtn.addEventListener("click", saveLayout);
}


function makeDraggable(winEl) {
  const header = winEl.querySelector(".window-header");
  if (!header) return;

  let offsetX, offsetY;

  header.onmousedown = function (e) {
    if(winEl.classList.contains("pinned")) return;

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

// Prevent dragging/resizing for pinned
function lockWindow(el) {
  el.style.resize = "none";
  el.style.cursor = "default";
}

document.getElementById("new-window-btn")?.addEventListener("click", () => {
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
    <button class="pin-btn">📌</button>
    <button class="delete-btn">🗑️</button>
    <h3>App ${windowCount}</h3>`;

  document.body.appendChild(newWin);

  makeDraggable(newWin); // allow movement
  attachPinButton(newWin); // set up pin behavior
  attachDeleteButton(newWin);

function attachPinButton(winEl) {
  const pinBtn = winEl.querySelector(".pin-btn");
  pinBtn.addEventListener("click", () => {
    winEl.classList.toggle("pinned");

    if (winEl.classList.contains("pinned")) {
      lockWindow(winEl);
      pinBtn.innerText = "📍";
    } else {
      winEl.style.resize = "both";
      winEl.style.cursor = "move";
      makeDraggable(winEl);
      pinBtn.innerText = "📌";
    }
  });
}

function attachDeleteButton(winEl) {
  const deleteBtn = winEl.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this window?")) {
      winEl.remove();
    }
  })
 }
});
