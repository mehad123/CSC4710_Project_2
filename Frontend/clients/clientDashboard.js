const backendURL = "http://localhost:5050";

document.addEventListener('DOMContentLoaded', async () => {
    const clientId = sessionStorage.getItem("clientId");
    if (!clientId) return;

    const res = await fetch(`${backendURL}/service-requests/${clientId}`);
    const requests = await res.json();
    loadTable(requests);
});

function formatDateTime(dtString){
    const dt = new Date(dtString);
    return dt.toLocaleString(); // will use local timezone and readable format
}

function loadTable(queries){
    const services = document.getElementById("service-list");
    let content = "";
    queries.forEach(c => {
        content += `
        <li>
            <section class='services'>
                Service #<a href='clientSR.html?SR=${c.requestId}'>${c.requestId}</a>
                | ${c.cleanType} | ${formatDateTime(c.preferredDateTime)}
            </section>
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

    const clientId = sessionStorage.getItem("clientId");
    const formData = new FormData(form);
    formData.append("clientId", clientId);

    fetch(`${backendURL}/service-requests`, {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(async data => {
        if(data.success){
            alert("Service request submitted!");
            form.reset();

            const res = await fetch(`${backendURL}/service-requests/${clientId}`);
            const updatedRequests = await res.json();
            loadTable(updatedRequests);
        } else {
            alert("Failed to submit service request.");
        }
    })
    .catch(err => {
        console.error(err);
        alert("Server error. Try again later.");
    });
});