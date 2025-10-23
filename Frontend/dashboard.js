const backendURL = "http://localhost:5050";

const form = document.getElementById("search-form");


document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch(backendURL + `/users`);
    const queries = await response.json();
    console.log(queries);

    loadTable(queries);
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fields = Object.fromEntries((new FormData(form)).entries());

    let response;
    let urlQueries;
    let queries;
    switch (e.submitter.value){
        case "username":
            response = await fetch(backendURL + `/users/${fields["username"]}`);
            break;
        case "firstname":
            response = await fetch(backendURL + `/users/firstname/${fields["firstname"]}`);
            break;
        case "lastname":
            response = await fetch(backendURL + `/users/lastname/${fields["lastname"]}`);
            break;
        case "salary":
            urlQueries = `minSalary=${encodeURIComponent(fields["minSalary"])}&maxSalary=${encodeURIComponent(fields["maxSalary"])}`;
            response = await fetch(backendURL + `/users/salary?${urlQueries}`);
            break;
        case "age":
            urlQueries = `minAge=${encodeURIComponent(fields["minAge"])}&maxAge=${encodeURIComponent(fields["maxAge"])}`;
            response = await fetch(backendURL + `/users/age?${urlQueries}`);
            break;
        case "registeredAfter":
            response = await fetch(backendURL + `/users/afterReg/${fields["regAfterUser"]}`);
            break;
        case "registeredCurrent":
            response = await fetch(backendURL + `/users/sameReg/${fields["regSameUser"]}`);
            break;
        case "registeredToday":
            response = await fetch(backendURL + `/users/today`);
            break;
        case "nosignin":
            response = await fetch(backendURL + `/users/nosignin`);
            break;
        case "all":
            response = await fetch(backendURL + `/users`);
            break;
    }
    if (!response.ok){
        console.error("Query failed!");
        queries = [];
    }else{
         queries = await response.json();
    }
   
    loadTable(queries);
});

function loadTable(queries){
    const tBody = document.getElementById("user-entries");
    let content = "";
    
    queries.forEach(row => {
        if (row["username"] === sessionStorage.getItem("loggedIn")){
            content += `<tr>
                <td>${row["username"]}</td>
                <td class="canedit" data-type="firstname">${row["firstname"]} </td>
                <td class="canedit" data-type="lastname">${row["lastname"]}</td>
                <td class="canedit" data-type="salary">${row["salary"]}</td>
                <td class="canedit" data-type="age">${row["age"]}</td>
                <td>${row["registerday"].split("T")[0]}</td>
                <td>${row["signintime"] ? 
                    new Date(row["signintime"]).toLocaleString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                    :
                    null
                }</td>
                <td>
                    <button onclick='deleteAccount()'>Delete</button>
                    <button id="toggleedit" onclick='toggleEdits()'>Edit</button>
                    <button id="submitedits" onclick='submitEdits()'>Submit</button>
                </td>
            </tr>`;
            return;
        }
        content += `<tr>
            <td>${row["username"]}</td>
            <td>${row["firstname"]}</td>
            <td>${row["lastname"]}</td>
            <td>${row["salary"]}</td>
            <td>${row["age"]}</td>
            <td>${row["registerday"].split("T")[0]}</td>
            <td>${row["signintime"] ? 
                new Date(row["signintime"]).toLocaleString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                })
                :
                null
            }</td>
        </tr>`;
    });
    tBody.innerHTML = content;
}

async function deleteAccount(){
    const response = await fetch(backendURL + `/users/${sessionStorage.getItem("loggedIn")}`, {
        method: "DELETE",
    });
    if (!response.ok){
        return;
    }
    sessionStorage.removeItem("loggedIn");
    window.location.href = "index.html";
}   
const savedFields = {
    "salary": null,
    "age": null,
    "firstname": null,
    "lastname": null
};
async function toggleEdits() {
    const isEditing = document.querySelectorAll(".canedit input").length > 0;
    document.getElementById("submitedits").hidden = isEditing;
    document.getElementById("toggleedit").textContent = isEditing ? "Edit" : "Cancel";
    document.querySelectorAll(".canedit").forEach(elem=>{
        if (isEditing){
            elem.textContent = savedFields[elem.dataset.type];
        }else{
            savedFields[elem.dataset.type] = elem.textContent;
            elem.innerHTML = `<input type="text" value="${elem.textContent}">`;
        }
    });

}

async function submitEdits() {
    const fields = {};
    document.querySelectorAll(".canedit").forEach(elem=>{
        const input = elem.querySelector("input");
        fields[elem.dataset.type] = input.value;
    });
    const response = await fetch(backendURL + `/users/${sessionStorage.getItem("loggedIn")}`, {
        "method": "PATCH",
        "headers": {"Content-Type": "application/json"},
        "body": JSON.stringify(fields)
    });
    if (!response.ok){
        alert("Edit Failed");
        return;
    }
    alert("Edit Succeeded!");
    toggleEdits();
    return;
}