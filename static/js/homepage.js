const isLoggedIn = document.body.dataset.authenticated === "true";
let counter = 0;
let firstClick;
let currentClick;
let cps;
let top_cps;


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(cookie.slice(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function setRecord(cps) {
    console.log(top_cps,cps,typeof(top_cps),typeof(cps))
    if (top_cps < cps) {
        top_cps = Math.round(cps*100)/100
        document.getElementById("top_cps").innerHTML = top_cps

        /* Check if user is logged in */
        if (isLoggedIn) {
            fetch("/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: JSON.stringify({ top_cps: top_cps })
            });
        }
}





}

function click() {
    counter++
    if (counter == 1){
        firstClick = new Date().getTime();
        document.getElementById("cps").innerText = "clicks per second: "+ 1.00
    } else if (counter<3) {
        currentClick = new Date().getTime();
        cps = ((counter / (currentClick-firstClick))*1000)
        /* Lower the cps that is attained from the first few clicks, it can cause issues with the record. */
        if (cps > 8) {
            cps = cps-6
        }        
        document.getElementById("cps").innerText = "clicks per second: " + Math.round(cps*100)/100
        setRecord(cps)
    } else {
        currentClick = new Date().getTime();
        cps = ((counter / (currentClick-firstClick))*1000)
        document.getElementById("cps").innerText = "clicks per second: " + Math.round(cps*100)/100
        setRecord(cps)
    }

}




document.addEventListener("DOMContentLoaded", function () {
top_cps = parseFloat(document.getElementById("top_cps").innerHTML)
document.getElementsByClassName("cps_button")[0].onclick = function () {
    click()
}




setInterval(() => {
        if (counter > 1) {
            cps = ((counter / (new Date().getTime()-firstClick))*1000)
            document.getElementById("cps").innerText = "clicks per second: " + Math.round(cps*100)/100
            setRecord(cps)
        }
    }, 1000);


setInterval(() => {
        if (currentClick && new Date().getTime() - currentClick >= 1750) {
            counter = 0;
            firstClick = null;
            document.getElementById("cps").innerText = "clicks per second: 0";


        }
    }, 500);

});


