const backendURL = "http://localhost:5050";

document.addEventListener('DOMContentLoaded', async () => {
    const clientID = sessionStorage.getItem("clientID");
    if (!clientID) return;

    const res = await fetch(`${backendURL}/service-requests/several/${clientID}`);
    const requests = await res.json();
    loadTable(requests);
});

function formatDateTime(dtString){
    const dt = new Date(dtString);
    return dt.toLocaleString(); 
}
 
function loadTable(queries){
    const services = document.getElementById("service-list");
    let content = "";
    queries.forEach(c => {
        content += `
        <li>
            Service Request ID: <a href='clientSR.html?SR=${c.requestID}'>${c.requestID}</a>
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
        if(data.success){
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