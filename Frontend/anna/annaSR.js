const backendURL = "http://localhost:5050";

let allowChanges = false;
let annasTurn;
let serviceRequest;

const srForm = document.getElementById("sr-info");
const chatElem = document.getElementById("chat");

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const requestID = params.get("requestID");

    const res = await fetch(`${backendURL}/service-requests/${requestID}`);
    serviceRequest = await res.json();
    annasTurn = serviceRequest["chatHistory"].length % i == 0;
    loadForm(serviceRequest);
    loadChat(serviceRequest);
});


function toggleEdit(){
    allowChanges = !allowChanges;
    loadForm(serviceRequest);
}

async function send(type, note){
    const formData = new FormData(srForm);

    serviceRequest["chatHistory"] = JSON.stringify([...serviceRequest["chatHistory"], {
        "state": type,
        "note": note
    }]);
    Object.keys(serviceRequest).forEach(field => {
        !formData.has(field) && formData.append(field, serviceRequest[field]);
    })
    
    // if (type === "ACCEPTED"){

    // }
    // if (type === "REJECTED"){

    // }
    // if (type === "RENEGOTIATING"){
        
    // }
    const response = await fetch(`${backendURL}/service-requests/${serviceRequest["requestID"]}`, {method: "POST", body: formData});
    const newRequest = await response.json();
    if (!newRequest.success){
        alert("Failed to change service request.");
        return
    }
    alert("Changes submitted!");
    serviceRequest = newRequest;
    annasTurn = false
    allowChanges= false
    loadForm(newRequest);
    loadChat(newRequest);
}
function loadForm(SR){
    
    let content = 
     `
        <h2>Service Request Info</h2>
        <fieldset>
            <legend>General Information</legend>
            <ul>
                <li>Request ID: ${SR["requestID"]}</li>
                <li>Client ID: ${SR["clientID"]}</li>
                <li>Status: ${SR["status"]}</li>
            </ul>
        </fieldset>
        ${
            allowChanges && annasTurn && !["COMPLETED", "CANCELED"].includes(SR["status"])
            ? 
            `
                <fieldset>
                    <legend>Fields to Modify</legend>
                    <ul>
                        <li>Address: <input name="address" type="text" value=${SR["address"]}></li>
                        <li>Type of Cleaning: <input name="cleanType" type="text" value=${SR["cleanType"]}></li>
                        <li>Number of Rooms: <input name="roomQuantity" type="number" value=${SR["roomQuantity"]}></li>
                        <li>Preferred Arrival: <input name="preferredDateTime" type="text" value=${SR["preferredDateTime"]}></li>
                        <li>Price: <input name="proposedBudget" type="number" value=${SR["proposedBudget"]}></li>
                        <li>Note: <input name="optionalNote" type="textarea" value=${SR["optionalNote"]}></li>
                    </ul>
                </fieldset>
            `
            :
            `
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
            `
        }
        ${SR["photos"].length > 0 &&
        `<fieldset>
            <legend>Images</legend>
            <ul>
                ${SR["photos"].map(url => `<img src=${url} alt="photo">`)}
            </ul>
        </fieldset>
        `}
    `;
    srForm.innerHTML = content;
}

function loadChat(SR){
    const chat = SR["chatHistory"];

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
    if (annasTurn && !["COMPLETED", "CANCELED"].includes(SR["status"])){
        content += 
        `
        <section class="send-message">
            <button onclick="send('accept')">Accept</button>
            <button onclick="send('reject')">Reject</button>
            <button onclick="send('renegotiate')">Renegotiate</button>
        </section>
        `
    }
    chatElem.innerHTML = content;
}