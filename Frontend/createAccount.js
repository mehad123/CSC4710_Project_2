const form = document.getElementById("create-form");
const errMssg = document.getElementById("create-error");
let timeoutID;

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5050/users",{
        method: "POST",
        body: new FormData(form)
    });

    const result = await response.text();
    if (result !== "ok"){
        clearTimeout(timeoutID);
        errMssg.innerText = "Failed to create new user!";
        alert("Failed to create new user!");
        timeoutID = setTimeout(()=>{
            errMssg.innerText = "";
        },1000);
        return;
    }
    alert("Successfully created account!");
    window.location.href = "signIn.html";
});


const pass = document.getElementById("createpass");
const toggleVis = document.getElementById("show-createpass");
toggleVis.onclick = () =>{
    pass.type = pass.type === "password" ? "text" : "password";
    toggleVis.innerText = pass.type === "password" ? "show" : "hide";
};