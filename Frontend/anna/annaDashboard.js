const backendURL = "http://localhost:5050";

document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch(backendURL + "/users");
    const clients = await response.json()
    loadClients(clients);
});

function loadClients(queries){
    const clients = document.getElementById("client-list");
    let content = "";
    queries.forEach(c => {
        content += ` 
        <li>
            <section class='client'>
                <ul class='client-info'>
                    <li>Name: ${c["firstname"]} ${c["lastname"]}</li>
                    <li>
                    Service Requests
                    <ul>
                        ${c["requestIDs"].map(id => `<li>${id}</li>`).join("")}
                    </ul>
                    </li>
                </ul>
            </section>
        </li>`;
    });
    clients.innerHTML = content;
}

