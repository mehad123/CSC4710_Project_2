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

    fetch(backendURL + "/users/bad")
    .then(res=> res.json())
    .then(bad => loadBad(bad));

    fetch(backendURL + "/users/good")
    .then(res=> res.json())
    .then(good => loadGood(good));

    fetch(backendURL + "/service-requests/accepted")
    .then(res=> res.json())
    .then(accepted => loadAccepted(accepted));

    fetch(backendURL + "/service-requests/largest")
    .then(res=> res.json())
    .then(larges => loadLargest(larges));

    fetch(backendURL + "/bills/overdue")
    .then(res=> res.json())
    .then(overdue => loadOverdue(overdue));

});

function loadAll(items){}
function loadFrequents(ites){}
function loadUncommited(items){}
function loadProspectives(items){}
function loadBad(items){}
function loadGood(items){}
function loadAccepted(items){}
function loadLargest(items){}
function loadOverdue(items){}

function loadClients(queries){
    const clients = document.getElementById("client-list");
    let content = "";
    queries.forEach(c => {
        content += `
        <li>
            <section class='client'>
                Client Name: ${c["name"]}
                <br/>
                Client Service Requests: 
                <ul>
                    ${
                        c["SRlist"].map(elem=>{
                            return `<li><a href='annaSR.html?SR=${elem}'>${elem}</a></li>`
                        }).join("")
                    }
                </ul>
            </section>
        </li>`;
    });
    clients.innerHTML = content;
}

