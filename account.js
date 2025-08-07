document.getElementById("password-form").addEventListener("submit", function(e) {
  e.preventDefault();

  const currentPw = document.getElementById("current-password").value.trim();
  const newPw = document.getElementById("new-password").value.trim();
  const loggedInEmail = localStorage.getItem("loggedInUser");

  let users = JSON.parse(localStorage.getItem("users")) || [];
  const userIndex = users.findIndex(user => user.email === loggedInEmail);

  if (userIndex === -1) {
    alert("User not found.");
    return;
  }

  if (users[userIndex].password !== currentPw) {
    alert("Incorrect current password.");
    return;
  }

  users[userIndex].password = newPw;
  localStorage.setItem("users", JSON.stringify(users));
  alert("Password updated successfully!");
});
