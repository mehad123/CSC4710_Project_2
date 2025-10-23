const form = document.getElementById("login-form");
const backBtn = document.querySelector('#back-btn');
const errorMsg = document.querySelector('#error-msg'); 

form.addEventListener("submit", async (e)=>{
    e.preventDefault();

    const fields = Object.fromEntries((new FormData(form)).entries());


    const {username, password} = fields;

    if (!username || !password) {
        errorMsg.textContent = "Please enter both username and password.";
        errorMsg.style.color = "red";
        return;
    }
    fetch("http://localhost:5050/users/login",{
        method: "POST",
        body: new FormData(form)
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.success) {
            console.log("Login successful!");
            alert("Login successful!");
            sessionStorage.setItem("loggedIn", username);
            window.location.href = "dashboard.html";
        } else {
            console.error("Sign-in failed:", data.message || data);
            alert("Invalid username or password!");
            errorMsg.textContent = "Invalid username or password.";
            errorMsg.style.color = "red";
        }
    })
    .catch(err => {
        console.error("Error during login:", err);
        errorMsg.textContent = "Server error. Please try again later.";
        errorMsg.style.color = "red";
    });
});

backBtn.onclick = function() {
    console.log("back clicked");
    window.location.href = "index.html";
};

const pass = document.getElementById("loginpass");
const toggleVis = document.getElementById("show-loginpass");
toggleVis.onclick = () =>{
    pass.type = pass.type === "password" ? "text" : "password";
    toggleVis.innerText = pass.type === "password" ? "show" : "hide";
};