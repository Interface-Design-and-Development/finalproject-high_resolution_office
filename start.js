function fadeInForm() {
  document.getElementById("login-form").style.opacity = 1;
}

window.onload = function () {
  const loginForm = document.getElementById("login-form");

  const loggedInEmail = localStorage.getItem("loggedInUser");
  if(loggedInEmail){
    window.location.href = "index.html";
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = loginForm.elements["uname"].value.trim();
    const password = loginForm.elements["psw"].value.trim();

    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }
    
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const matchedUser = users.find(user => user.email === username && user.password === password);

    if (matchedUser) {
    //keeps track of logged in user
      localStorage.setItem("loggedInUser", matchedUser.email);
      alert(`Welcome back, ${matchedUser.firstName}!`);
      window.location.href = "home.html";
    } else {
      alert("Incorrect username or password.");
    }
  });
};
