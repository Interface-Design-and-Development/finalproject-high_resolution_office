function fadeInForm() {
  document.getElementById("signup-form").style.opacity = 1;
}

window.onload = function () {
  document.getElementById("signup-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!firstName || !lastName || !email || !password) {
      alert("Please fill out all fields.");
      return;
    }

    // Save user data to localStorage and creates list for multiple users
     let users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if email is already registered
    const userExists = users.some(user => user.email === email);
    if (userExists) {
      alert("This email is already registered. Please log in.");
      window.location.href = "index.html"
      return;
    }
    
    const newUser = {
      email,
      password,
      firstName,
      lastName,
      layout: []
    };

    // Save new user
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration successful! You can now log in.");
    window.location.href = "index.html";
  });
};

