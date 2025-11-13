const backendURL = "http://localhost:5050";

document.addEventListener('DOMContentLoaded', async () => {
    loadTable([
        {"serviceNumber": "10001"},
        {"serviceNumber": "10002"},
        {"serviceNumber": "10004"},
        {"serviceNumber": "10005"}
    ]);
});

function loadTable(queries){
    const services = document.getElementById("service-list");
    let content = "";
    queries.forEach(c => {
        content += `
        <li>
            <section class='services'>
                Service #<a href='clientSR.html?SR=${c.serviceNumber}'>${c.serviceNumber}</a>
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
