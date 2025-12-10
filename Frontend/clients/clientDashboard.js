const backendURL = "http://localhost:5050";

let clientInfo;

document.addEventListener('DOMContentLoaded', async () => {
    const clientID = sessionStorage.getItem("clientID");
    if (!clientID) return;

    const res = await fetch(`${backendURL}/users/${clientID}`);
    const data = await res.json();
    clientInfo = data
    console.log(clientInfo)
    loadTable(clientInfo);
});

function formatDateTime(dtString){
    const dt = new Date(dtString);
    return dt.toLocaleString(); 
}
  
function loadTable(){
    const services = document.getElementById("service-list");
    let content = "";
    clientInfo["requestIDs"].forEach(id => {
        content += `
        <li>
            Service Request ID: <a href='clientSR.html?requestID=${id}'>${id}</a>
        </li>`;
    });
    services.innerHTML = content;
}

const photoUpload = document.getElementById('photoUpload');
const errorMsg = document.getElementById('file-error');
const MAX_FILES = 5;

photoUpload.addEventListener('change', () => {
    if (photoUpload.files.length > MAX_FILES) {
        errorMsg.textContent = `You can upload a maximum of ${MAX_FILES} images.`;
        photoUpload.value = "";
    } else {
        errorMsg.textContent = "";
    }
});

const form = document.getElementById("create-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const clientID = sessionStorage.getItem("clientID");
    const formData = new FormData(form);
    formData.append("clientID", clientID);

    fetch(`${backendURL}/service-requests`, {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(async data => {
        const newRequestID = data["requestID"]
        if(data.success){
            await fetch(`${backendURL}/users/${clientID}`, {
                "method": "PUT",
                "headers": {"Content-Type": "application/json"},
                "body": JSON.stringify({"updatedFields": {"requestIDs": JSON.stringify([...clientInfo["requestIDs"], newRequestID])}})
            })
            alert("Service request submitted!");
            window.location.reload()
        } else {
            alert("Failed to submit service request."); 
        }
    })
    .catch(err => {
        console.error(err);
        alert("Server error. Try again later.");
    });
});