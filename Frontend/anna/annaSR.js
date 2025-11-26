const backendURL = "http://localhost:5050";

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const requestID = params.get("requestID");

    const res = await fetch(`${backendURL}/service-requests/${requestID}`);
    const serviceRequest = await res.json();
    loadForm(serviceRequest);
    loadChat(serviceRequest);
});

function loadForm(SR){
    const srElem = document.getElementById("SR-info");
    let content = 
     `
    <form>
        <h2>Service Request Info</h2>
        <fieldset>
            <legend>General Information</legend>
            <ul>
                <li>Request ID: ${SR["requestID"]}</li>
                <li>Client ID: ${SR["clientID"]}</li>
                <li>Status: ${SR["status"]}</li>
            </ul>
        </fieldset>
        <fieldset>
            <legend>Fields to Modify</legend>
            <ul>
                <li>Address: ${SR["address"]}</li>
                <li>Type of Cleaning: ${SR["cleanType"]}</li>
                <li>Number of Rooms: ${SR["roomQuantity"]}</li>
                <li>Preferred Arrival: ${SR["preferredDateTime"]}</li>
                <li>Price: ${SR["proposedBudget"]}</li>
                <li>Note: <p>${SR["optionalNote"] || "None"}</p></li>
            </ul>
        </fieldset>
    </form>
    `
    srElem.innerHTML = content;
}

function loadChat(SR){
    const chat = SR["chatHistory"];
    const chatElem = document.getElementById("chat");

    chat.forEach(msg => {
        content += 
        `
        <section class="message">
            <ul>
                <li>Decision: ${msg["state"]}</li>
                <li>Note: ${msg["note"]}/</li>
            </ul>
        </section>
        `
    });
    if (chat.length % 2 && SR["status"] != "complete"){
        content += 
        `
        <section class="send-message">
            <input type="textarea" placeholder="Include note with decision">
            <button>Accept</button>
            <button>Reject</button>
            <button>Renegotiate</button>
        </section>
        `
    }
    chatElem.innerHTML = content;
}