// Global variables
const isLoggedIn = document.body.dataset.authenticated === "true";
let counter = 0;
let firstClick;
let currentClick;
let cps;
let top_cps;

// function to get browser token cookie to send with fetch requests to server
const getCookie = (name) => {
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
    // if the users historic top_cps is lower than the current cps
    if (top_cps < cps) {
        top_cps = Math.round(cps*100)/100
        // update the dom with the new top_cps
        document.getElementById("top_cps").innerHTML = top_cps

        // if the user is logged in, set the new top_cps record for the user
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


// function for the cps button
const click = () => {
    currentClick = new Date().getTime();
    // increment the click counter
    counter++
    // if this is the users first click, set the cps to 1.
    if (counter == 1){
        firstClick = new Date().getTime();
        document.getElementById("cps").innerText = "clicks per second: 1.00"
    }
    // if the click counter is less than 4 balance the clicks so users dont exploit the first few clicks to set a huge record.  
    else if (counter<4) {
        cps = ((counter / (currentClick-firstClick))*1000)
        if (cps > 15) {
            cps = cps-12
        }
        else if (cps > 8) {
            cps = cps-6
        }        
        document.getElementById("cps").innerText = "clicks per second: " + Math.round(cps*100)/100
        // attempt to set the users record CPS if applies.
        setRecord(cps)
    } else {// if this is just a regular click somewhere inbetween change the cps accordingly
        cps = ((counter / (currentClick-firstClick))*1000)
        document.getElementById("cps").innerText = "clicks per second: " + Math.round(cps*100)/100
        // attempt to set the users record CPS if applies.
        setRecord(cps)
    }

}



// once the page has loaded:
document.addEventListener("DOMContentLoaded", function () {
top_cps = parseFloat(document.getElementById("top_cps").innerHTML)
// cps button set onclick
document.getElementsByClassName("cps_button")[0].onclick = function () {
    click()
}




setInterval(() => {
    // update the cps automatically every second
        if (counter > 1) {
            cps = ((counter / (new Date().getTime()-firstClick))*1000)
            document.getElementById("cps").innerText = "clicks per second: " + Math.round(cps*100)/100
            // set a record if applies
            setRecord(cps)
        }
    }, 1000);


// reset cps to 0 if user is inactive for a couple of seconds
setInterval(() => {
        if (currentClick && new Date().getTime() - currentClick >= 500) {
            counter = 0;
            cps = 0;
            firstClick = null;
            document.getElementById("cps").innerText = "clicks per second: 0";
        }
    }, 200);

// reset cps to 0 every 5 seconds so the cps doesn't stagnate over a long period of time
setInterval(() => {
    counter = 0;
    cps = 0;
    firstClick = null;
}, 5083);

});





