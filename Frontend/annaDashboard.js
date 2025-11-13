const backendURL = "http://localhost:5050";


document.addEventListener('DOMContentLoaded', async () => {
    loadTable([
        {
            "name": "phil",
            "SRlist": ["s73bq", "ded2dn"]
        },
        {
            "name": "sam",
            "SRlist": ["e328hdq"]
        },
        {
            "name": "emma",
            "SRlist": ["sw32d", "dnewu3", "sh392e", "dn389", "denu923"]
        },
        {
            "name": "craig",
            "SRlist": ["dewwed3", "s29dd", "s29do"]
        }
    ]);
});

function loadTable(queries){
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

