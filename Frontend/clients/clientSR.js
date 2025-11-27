const backendURL = "http://localhost:5050";

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const requestID = params.get("SR");

    if (!requestID) {
        console.error("No request ID found in URL.");
        return;
    }

    const res = await fetch(`${backendURL}/service-requests/request/${requestID}`);
    const serviceRequest = await res.json();

    loadTable(serviceRequest);
    loadPhotos(serviceRequest.photos || []);
});


function loadTable(req) {
    const table = document.getElementById("request-table");

    table.innerHTML = `
        <tr><td>Request ID</td><td>${req.requestID}</td></tr>
        <tr><td>Client ID</td><td>${req.clientID}</td></tr>
        <tr><td>Address</td><td>${req.address}</td></tr>
        <tr><td>Clean Type</td><td>${req.cleanType}</td></tr>
        <tr><td>Room Quantity</td><td>${req.roomQuantity}</td></tr>
        <tr><td>Preferred Date & Time</td><td>${formatDate(req.preferredDateTime)}</td></tr>
        <tr><td>Proposed Budget</td><td>$${req.proposedBudget}</td></tr>
        <tr><td>Optional Note</td><td>${req.optionalNote || "None"}</td></tr>
    `;
}

function formatDate(dateString) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
}

function loadPhotos(photoArray) {
    const photoDiv = document.getElementById("photos");
    if (!photoDiv) return;
    if (!photoArray.length) {
        photoDiv.innerHTML = "<p>No photos uploaded</p>";
        return;
    }
    photoDiv.innerHTML = photoArray
        .map(base64 => `<img src="data:image/jpeg;base64,${base64}" width="120" style="margin:5px;">`)
        .join("");
}