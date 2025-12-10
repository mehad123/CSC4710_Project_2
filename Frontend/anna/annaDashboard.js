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

    fetch(backendURL + "/users/frequents")
    .then(res=> res.json())
    .then(freqeunts => loadFrequents(freqeunts));

    fetch(backendURL + "/users/uncommitted")
    .then(res=> res.json())
    .then(uncommitted => loadUncommited(uncommitted));

    fetch(backendURL + "/users/prospectives")
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
                <ul>
                    <li>Client Name: ${client["firstname"]} ${client["lastname"]}</li>
                    <li>
                        Client Service Requests: 
                        <ul>
                            ${
                                client["SRlist"].map(elem=>{
                                    return `<li><a href='annaSR.html?requestID=${elem}'>${elem}</a></li>`
                                }).join("")
                            }                        
                        </ul>
                    </li>
                </ul>
                Client Name: ${client["name"]}
                <br/>
                Client Service Requests: 
                <ul>
                    ${
                        client["SRlist"].map(elem=>{
                            return `<li><a href='annaSR.html?requestID=${elem}'>${elem}</a></li>`
                        }).join("")
                    }
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
    clients.innerHTML = content;
}
function loadFrequents(items){
    const frequents = document.getElementById("frequent-clients");
    let content = "";
    items.forEach(c => {
        content += loadClient(c);
    });
    frequents.innerHTML = content;
}
function loadUncommited(items){
    const uncommitted = document.getElementById("uncommitted-clients");
    let content = "";
    items.forEach(c => {
        content += loadClient(c);
    });
    uncommitted.innerHTML = content;
}
function loadProspectives(items){
    const prospectives = document.getElementById("prospective-clients");
    let content = "";
    items.forEach(c => {
        content += loadClient(c);
    });
    prospectives.innerHTML = content;
}

function loadGood(items){
    const goodClients = document.getElementById("good-clients");
    let content = "";
    items.forEach(c => {
        content += loadClient(c);
    });
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
        content += loadClient(c);
    });
    accepted.innerHTML = content;
}
function loadLargest(items){
    const bigJobs = document.getElementById("largest-jobs");
    let content = "";
    items.forEach(c => {
        content += loadClient(c);
    });
    bigJobs.innerHTML = content;
}
function loadOverdue(items){
    const overdue = document.getElementById("overdue-bills");
    let content = "";
    items.forEach(c => {
        content += loadClient(c);
    });
    overdue.innerHTML = content;
}

