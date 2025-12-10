const backendURL = "http://localhost:5050";


let serviceRequest;
let currentBill;

let srstatus;
let annasTurn;

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
        serviceRequest = SR;
        annasTurn = serviceRequest["chatHistory"].length % 2 == 0;
        if (!["ORDERING", "CANCELED"].includes(SR["status"])){
            fetch(`${backendURL}/service-orders/${requestID}`)
            .then(res => res.json())
            .then(order => loadServiceOrder(order));

            fetch(`${backendURL}/bills/${requestID}`)
            .then(res => res.json())
            .then(bills => {
                currentBill = bills.at(-1) 
                loadBill(currentBill)
            })
        }
        loadServiceRequest(SR);
        loadChat(SR);
    })


}); 

 

function loadServiceRequest(SR){

    let content = 
     `
        <h2>Service Request Information</h2>
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
                <li>Note: ${SR["optionalNote"] || "None"}</li>
            </ul>
        </fieldset>
        ${SR["photos"].length > 0 ?
            `<fieldset>
                <legend>Images</legend>
                <ul id='images'>
                    ${SR["photos"].map(url => `<li><a href='${url}' target='_blank'><img src='${url}' alt="photo"></a></li>`).join("")}
                </ul>
            </fieldset>` : ""
        }
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
    console.log(SR)
    const chat = SR["chatHistory"];
    console.log(chat)
    let messages = "";
    let hub = "";
    chat.forEach((msg, i) => {  
        console.log(msg)
        if (i % 2 == 0){
            messages += 
            `
            <section class="message">
                <h3>Anna</h3>
                ${
                    msg["status"] === "ORDERING" 
                    ?
                    `
                    <article class="quote">   
                        <ul>
                            <li>Scheduled window:<br> ${new Date(msg["windowStart"]).toLocaleString()} to ${new Date(msg["windowEnd"]).toLocaleString()}</li>
                            <li>Price: ${msg["price"]}</li>
                        </ul>
                        <br>
                        ${msg["note"]}
                    </article>
                    `
                    :
                    `
                    <section class="message">
                        ${msg?.["revision"] ? '<strong><i>Anna has revised the bill</i></strong><br>' : ""}
                        ${msg["note"]}
                    </section>
                    `
                }

            </section>
            `
        }else{
            messages += 
            `
            <section class="message">
                <h3>Client</h3>
                ${msg["note"]}
            </section>
            `
        }
    });
    if (!["COMPLETED", "CANCELED"].includes(serviceRequest["status"])){
        if (annasTurn){
            if (serviceRequest["status"] === "ORDERING"){
                hub += 
                `
                <section id="message-hub">
                    <button onclick="handleReject()">Reject</button>
                    <button onclick="document.getElementById('create-quote').style.display = 'block'">Respond with quote</button>
                </section>
                `
            }
            if (serviceRequest["status"] === "BILLING"){
                hub += 
                `
                <section id="message-hub">
                    <textarea id="message"></textarea>
                    <button onclick="sendMessage()">Respond with message</button>
                    <button onclick="reviseBill()">Respond with bill revision</button>
                </section>
                `
            }
        }else{
            hub +=`
                <section id="message-hub">
                    Pending message from Client...
                </section>
            `
        }
    }

    chatElem.innerHTML = `
        <h2>Chat</h2>
        <hr>
        <section id='chatDisplay'>
            ${messages}
        </section>
        <section id="chatHub">
            ${hub}
        </section>
    `;
}

async function handleReject(){
    serviceRequest["status"] = "CANCELED";
    serviceRequest["chatHistory"].push({
        "status": "CANCELED",
        "note": "Anna has declined",
    })

    const response = await fetch(`${backendURL}/service-requests/${serviceRequest["requestID"]}`, {
        "method": "PUT",
        "headers": {"Content-Type": "application/json"},
        "body": JSON.stringify({"updatedFields": {"status": "CANCELED","chatHistory":JSON.stringify(serviceRequest["chatHistory"])}})
    })
    window.location.reload();
}

async function createQuote(){
    const note = document.getElementById("quote-note").value
    const windowStart = document.getElementById("quote-windowStart").value
    const windowEnd = document.getElementById("quote-windowEnd").value
    const price = document.getElementById("quote-price").value

    const makeQuoteRes = await fetch(`${backendURL}/quotes`,{
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "body": JSON.stringify({"clientID": serviceRequest["clientID"], note, windowStart, windowEnd, price})
    })
    const data = await makeQuoteRes.json();

    serviceRequest["chatHistory"].push({
        "status": "ORDERING",
        note,
        windowStart,
        windowEnd,
        price,
        "quoteID": data["quoteID"]
    });
    const updatedSRRes = await fetch(`${backendURL}/service-requests/${serviceRequest["requestID"]}`, {
        "method": "PUT",
        "headers": {"Content-Type": "application/json"},
        "body": JSON.stringify({"updatedFields": {"chatHistory": JSON.stringify(serviceRequest["chatHistory"])}})
    })
    console.log(updatedSRRes)
    window.location.reload()
}

async function sendMessage() {
    const message = document.getElementById("message").value;
    serviceRequest["chatHistory"].push({
        "status": "BILLING",
        "note": message,
    })
    serviceRequest["chatHistory"] = JSON.stringify(serviceRequest["chatHistory"])

    const response = await fetch(`${backendURL}/service-requests/${serviceRequest["requestID"]}`, {
        "method": "PUT",
        "headers": {"Content-Type": "application/json"},
        "body": JSON.stringify(serviceRequest)
    })
    window.location.reload();
}

async function reviseBill() {
    const price = document.getElementById("bill-price").value
    const note = document.getElementById("bill-note").value


    const cancelBillResponse = await fetch(`${backendURL}/bills/${currentBill["billID"]}`,{
        "method": "PUT",
        "headers": {"Content-Type": "application/json"},
        "body": JSON.stringify({"updatedFields": {"canceled": true}})
    })

    const newBillResponse = await fetch(`${backendURL}/bills`,{
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "body": JSON.stringify({"clientID": serviceRequest["clientID"], price})
    })
    serviceRequest["chatHistory"].push({
        "status": "BILLING",
        note,
    });
    serviceRequest["chatHistory"] = JSON.stringify(serviceRequest["chatHistory"])
    const response = await fetch(`${backendURL}/service-requests/${serviceRequest["requestID"]}`, {
        "method": "PUT",
        "headers": {"Content-Type": "application/json"},
        "body": JSON.stringify(serviceRequest)
    })
    window.location.reload()
}
