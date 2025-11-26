const backendURL = "http://localhost:5050";

document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch(backendURL + "/users");
    const clients = await response.json()
    loadTable(clients);
});

function loadTable(queries){
    const clients = document.getElementById("client-list");
    let content = "";
    queries.forEach(c => {
        c["requestIDs"] = ["123"]
        content += `
        <li>
            <section class='client'>
                <ul>
                    <li>Name: ${c["firstname"]} ${c["lastname"]}</li>
                    <li>Client ID: ${c["clientID"]}</li>
                    <li>Service Requests:<ul>
                    ${c["requestIDs"].map(id=>
                        `<li><a href="annaSR.html?requestID=${id}">${id}</a></li>`
                    ).join("")}
                    </ul></li>
                </ul>
            </section>
        </li>`;
    });
    clients.innerHTML = content;
}

