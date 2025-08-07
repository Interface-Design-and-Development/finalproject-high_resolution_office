
//ADD LOGOUT BUTTON TO HTML FILE
document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "start.html"
});

window.onload = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const loggedInEmail = localStorage.getItem("loggedInUser");
    const currentUser = users.find(user => user.email === loggedInEmail);

    if(!currentUser) {
        window.location.href = "start.html";
    }
    //ADD WELCOME MESSAGE ON HOME PAGE ADD TO HTML FILE!!!
    document.getElementById("welcome-msg").innerText = `Welcome, ${currentUser.firstName}!`;
};