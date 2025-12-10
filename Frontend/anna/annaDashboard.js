const backendURL = "http://localhost:5050";



document.addEventListener('DOMContentLoaded', async () => {
    /*
    This topmost "get all users" can easily be optimized to only send 
    a fixed amount at a time, but it's almost never needed until we have
    hundreds of clients
    */
    fetch(backendURL + "/users")
    .then(res=> res.json())
    .then(all => loadAll(all));

    fetch(backendURL + "/users/frequent")
    .then(res=> res.json())
    .then(freqeunts => loadFrequents(freqeunts));

    fetch(backendURL + "/users/uncommitted")
    .then(res=> res.json())
    .then(uncommitted => loadUncommited(uncommitted));

    fetch(backendURL + "/users/prospective")
    .then(res=> res.json())
    .then(prospectives => loadProspectives(prospectives));

    fetch(backendURL + "/users/good")
    .then(res=> res.json())
    .then(good => loadGood(good));

    fetch(backendURL + "/users/bad")
    .then(res=> res.json())
    .then(bad => loadBad(bad));


    fetch(backendURL + "/quotes/accepted")
    .then(res=> res.json())
    .then(accepted => loadAccepted(accepted));


    fetch(backendURL + "/service-requests/largest")
    .then(res=> res.json())
    .then(larges => loadLargest(larges));


    fetch(backendURL + "/bills/overdue")
    .then(res=> res.json())
    .then(overdue => loadOverdue(overdue));

});

function loadClient(client){
    const content = 
    `
        <li>
            <section class='client'>
                <span>Client Name: ${client["firstname"]} ${client["lastname"]}</span><br>
                <span>Client ID: <br> ${client["clientID"]}</span>

                <br>
                <span>Recent Service Requests: </span>
                <ul>
                    ${
                        client["requestIDs"].slice(-3).reverse().map(elem=>{
                            return `<li><a href='annaSR.html?requestID=${elem}'>${elem}</a></li>`
                        }).join("")
                    }                        
                </ul>
            </section>
        </li>
    `
    return content
}
function loadServiceRequests(request){
    const content = 
    `
        <li>
            <section class='service-request'>
                <span>Client ID: <br> ${request["clientID"]}</span><br>
                <span>Request ID:<br> <a href='annaSR.html?requestID=${request["requestID"]}'>${request["requestID"]}</a></span>
                <br>
                <span>Service Request Info: </span>
                <ul>
                    <li>Status: ${request["status"]}</li>                         
                    <li>Number of rooms: ${request["roomQuantity"]}</li>                         
                </ul>
            </section>
        </li>
    `
    return content
}

function loadBill(bill){
    const content = 
    `
        <li>
            <section class='bill'>
                <span>Client ID: <br> ${bill["clientID"]}</span><br>
                <span>Bill ID:<br> ${bill["billID"]}</span>
                <br>
                <span>Bill Info: </span>
                <ul>
                    <li>Total: $${bill["price"]}</li>
                    <li>Generated: ${bill["generated"]}</li>                         
                    <li>Paid: ${request["paid"] || "Unpaid"}</li>                         
                </ul>
            </section>
        </li>
    `
    return content
}
function loadQuote(quote){
    const content = 
    `
        <li>
            <section class='quote'>
                <span>Client ID: <br> ${quote["clientID"]}</span><br>
                <span>Quote ID:<br> ${quote["quoteID"]}</span>
                <br>
                <span>Bill Info: </span>
                <ul>
                    <li>Total: $${quote["price"]}</li>
                    <li>Status: ${quote["status"]}</li>                         
                    <li>Decided: ${quote["decided"] || "unknown"}</li>                         
                </ul>
            </section>
        </li>
    `
    return content
}



function loadAll(items){
    const clients = document.getElementById("all-clients");
    let content = "";
    items.forEach(c => {
        content += loadClient(c);
    });
    if (items.length === 0){
        content = "No items yet"
    }
    clients.innerHTML = content;
}
function loadFrequents(items){
    const frequents = document.getElementById("frequent-clients");
    let content = "";
    items.forEach(c => {
        content += loadClient(c);
    });
    if (items.length === 0){
        content = "No items yet"
    }
    frequents.innerHTML = content;
}
function loadUncommited(items){
    const uncommitted = document.getElementById("uncommitted-clients");
    let content = "";
    items.forEach(c => {
        content += loadClient(c);
    });
    if (items.length === 0){
        content = "No items yet"
    }
    uncommitted.innerHTML = content;
}
function loadProspectives(items){
    const prospectives = document.getElementById("prospective-clients");
    let content = "";
    items.forEach(c => {
        content += loadClient(c);
    });
    if (items.length === 0){
        content = "No items yet"
    }
    prospectives.innerHTML = content;
}

function loadGood(items){
    const goodClients = document.getElementById("good-clients");
    let content = "";
    items.forEach(c => {
        content += loadClient(c);
    });
    if (items.length === 0){
        content = "No items yet"
    }
    goodClients.innerHTML = content;
}

function loadBad(items){
    const badClients = document.getElementById("bad-clients");
    let content = "";
    items.forEach(c => {
        content += loadClient(c);
    });
    badClients.innerHTML = content;
}
function loadAccepted(items){
    const accepted = document.getElementById("accepted-quotes");
    let content = "";
    items.forEach(c => {
        content += loadQuote(c);
    });
    if (items.length === 0){
        content = "No items yet"
    }
    accepted.innerHTML = content;
}
function loadLargest(items){
    const bigJobs = document.getElementById("largest-jobs");
    let content = "";
    items.forEach(c => {
        content += loadServiceRequests(c);
    });
    if (items.length === 0){
        content = "No items yet"
    }
    bigJobs.innerHTML = content;
}
function loadOverdue(items){
    const overdue = document.getElementById("overdue-bills");
    let content = "";
    items.forEach(c => {
        content += loadBill(c);
    });
    if (items.length === 0){
        content = "No items yet"
    }
    overdue.innerHTML = content;
}

