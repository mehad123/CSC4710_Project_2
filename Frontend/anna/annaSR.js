const backendURL = "http://localhost:5050";

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const requestID = params.get("requestID");

    const res = await fetch(`${backendURL}/service-requests/${requestID}`);
    const request = await res.json();
    console.log(request)
    loadTable(request);
});

function load(requests){
    let tableContent = "";


}