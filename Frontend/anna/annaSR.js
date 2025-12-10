const backendURL = "http://localhost:5050";

let allowChanges = false;
let annasTurn;
let serviceRequest;

const srTitle = document.getElementById("page-title");

const srForm = document.getElementById("sr-form");
const orderForm = document.getElementById("order-form")
const billForm = document.getElementById("bill-form")


const chatElem = document.getElementById("chat");

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const requestID = params.get("requestID");
    srTitle.innerText = `Service Request ${requestID}`;

    fetch(`${backendURL}/service-requests/${requestID}`)
    .then(res => res.json())
    .then(SR => {
        annasTurn = serviceRequest["chatHistory"].length % i == 0;
        serviceRequest = SR;
        loadServiceRequest(SR);
        loadChat(SR);
    })

    fetch(`${backendURL}/service-orders/${requestID}`)
    .then(res => res.json())
    .then(order => loadServiceOrder(order));

    fetch(`${backendURL}/bills/${requestID}`)
    .then(res => res.json())
    .then(bills => loadBill(bills[bills.length-1]))
}); 



function loadServiceRequest(SR){
    console.log("SR: ", SR);

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
        <fieldset>
            <legend>Cleaning Information</legend>
            <ul>
                <li>Address: ${SR["address"]}</li>
                <li>Type of Cleaning: ${SR["cleanType"]}</li>
                <li>Number of Rooms: ${SR["roomQuantity"]}</li>
                <li>Preferred Arrival: ${SR["preferredDateTime"]}</li>
                <li>Price: ${SR["proposedBudget"]}</li>
                <li>Note: <p>${SR["optionalNote"] || "None"}</p></li>
            </ul>
        </fieldset>
        ${/*SR["photos"].length > 0 &&
        `<fieldset>
            <legend>Images</legend>
            <ul>
                ${SR["photos"].map(url => `<img src=${url} alt="photo">`)}
            </ul>
        </fieldset>
        `*/}
    `;
    srForm.innerHTML = content;
}

function loadServiceOrder(order){
    console.log("Order: ", order);
    let content = 
     `
        <h2>Order</h2>
        <fieldset>
            <legend>Order Identification</legend>
            <ul>
                <li>Order ID: ${order["orderID"]}</li>
                <li>Client ID: ${order["clientID"]}</li>
            </ul>
        </fieldset>
        <fieldset>
            <legend>Order Information</legend>
            <ul>
                <li>Address: ${order["address"]}</li>
                <li>Type of Cleaning: ${order["cleanType"]}</li>
                <li>Number of Rooms: ${order["roomQuantity"]}</li>
                <li>Arrival Time: ${order["windowStart"]} to ${order["windowEnd"]}</li>
                <li>Price: ${order["price"]}</li>
                <li>Note: <p>${order["optionalNote"] || "None"}</p></li>
            </ul>
        </fieldset>
    `;
    orderForm.innerHTML = content;
}
function loadBill(bill){
    console.log("Bill:", bill)
    let content = 
     `
        <h2>Bill</h2>
        <fieldset>
            <legend>Receipt Information</legend>
            <ul>
                <li>Bill ID: ${order["billID"]}</li>
                <li>Client ID: ${bill["clientID"]}</li>
            </ul>
        </fieldset>
        <fieldset>
            <legend>Billing Information</legend>
            <ul>
                <li>Date Generated: ${bill["generated"]}</li>
                <li>Date Paid: ${bill["paid"] || "None"}</li>
                <li>Total: ${order["price"]}</li>
            </ul>
        </fieldset>
    `;
    billForm.innerHTML = content;
}
function loadChat(SR){
    // const chat = SR["chatHistory"];

    // chat.forEach(msg => {  
    //     content += 
    //     `
    //     <section class="message">
    //         <ul>
    //             <li>Decision: ${msg["state"]}</li>
    //             <li>Note: ${msg["note"]}/</li>
    //         </ul>
    //     </section>
    //     `
    // });
    // if (annasTurn && !["COMPLETED", "CANCELED"].includes(SR["status"])){
    //     content += 
    //     `
    //     <section class="send-message">
    //         <button onclick="send('accept')">Accept</button>
    //         <button onclick="send('reject')">Reject</button>
    //         <button onclick="send('renegotiate')">Renegotiate</button>
    //     </section>
    //     `
    // }
    // chatElem.innerHTML = content;
}


// function toggleEdit(){
//     allowChanges = !allowChanges;
//     loadForm(serviceRequest);
// }
// async function send(type, note){
//     const formData = new FormData(srForm);

//     serviceRequest["chatHistory"] = JSON.stringify([...serviceRequest["chatHistory"], {
//         "state": type,
//         "note": note
//     }]);
//     Object.keys(serviceRequest).forEach(field => {
//         !formData.has(field) && formData.append(field, serviceRequest[field]);
//     })
    
//     // if (type === "ACCEPTED"){

//     // }
//     // if (type === "REJECTED"){

//     // }
//     // if (type === "RENEGOTIATING"){
        
//     // }
//     const response = await fetch(`${backendURL}/service-requests/${serviceRequest["requestID"]}`, {method: "POST", body: formData});
//     const newRequest = await response.json();
//     if (!newRequest.success){
//         alert("Failed to change service request.");
//         return
//     }
//     alert("Changes submitted!");
//     serviceRequest = newRequest;
//     annasTurn = false
//     allowChanges= false
//     loadForm(newRequest);
//     loadChat(newRequest);
// }