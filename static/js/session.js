/* eslint-disable no-undef */
// global variables
let send_tutorial_to_player2 = false
let player1 = undefined
let player2 = undefined
let mode_type = "First to 100 clicks"
let mode_value;



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



// once the DOM loads:
document.addEventListener("DOMContentLoaded", async function () {
    // set the default selected more to 'first to 50'
    let value_selector = document.getElementById("value_select")
    value_selector.value = "50"
    change_tutorial("first to", "50")
    let game_selector = document.getElementById("gamemode_select")
    // set the link box to have the current page url
    document.getElementById("game_link").value = window.location.href
    // set start game button onclick function
    document.getElementById("start_game").onclick = () => {
        // update db, set the current game to started
        fetch(`/api/games/${game_id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                edit_field: 'started',
                edit_replacement: true
            })
        })
        .then(response => response.json())
        /* .then(data => {
            console.log(data);
        })*/;


        document.getElementById("start_game").disabled = true;
    }
    // set copy link button onclick
    let copy_button = document.getElementById("copy_link_button")
    copy_button.onclick = () => {
    const copyText = document.getElementById("game_link");

    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices

    navigator.clipboard.writeText(copyText.value);

    copy_button.innerHTML = "Copy ✅"

    }

    // hide the select options for the gamemode "best top speed"
    const best_top_options = document.getElementsByClassName("best_top_values");
    for (let i = 0; i < best_top_options.length; i++) {
        best_top_options[i].style.display = "none";
    }

    // function to change tutorial based on what is selected
    const change_tutorial_automatically = () => {
        let title = 'first to'
        if (game_selector.value.slice(0,8).toLowerCase() == 'first to') {
            title = 'first to'
            // change the select option value to be the actual current value
            document.getElementById("select_first_to_value").textContent = value_selector.value
        } else {
            title = 'best top speed'
            // change the select option value to be the actual current value
            document.getElementById("select_best_top_value").textContent = value_selector.value
        }
        change_tutorial(title,value_selector.value)
    }

    // when the value selector is changed, change the tutorial
    value_selector.onchange = () => {
        change_tutorial_automatically()
    }


    // when game selector is changed
    game_selector.onchange = () => {
        const first_to_options = document.getElementsByClassName("first_to_values");
        const best_top_options = document.getElementsByClassName("best_top_values");

        // if the game selected is "first to x clicks"
        if (game_selector.value.slice(0,8).toLowerCase() == 'first to') {
            value_selector.value = "50"
            // change the select option value of the gamemode best top speed to the default value (10)
            document.getElementById("select_best_top_value").textContent = 10
            // hide best top speed gamemode options
            for (let i = 0; i < best_top_options.length; i++) {
                best_top_options[i].style.display = "none";
            }
            // show first to clicks gamemode options
            for (let i = 0; i < first_to_options.length; i++) {
                first_to_options[i].style.display = "initial";
            }
        } else { // if the game selected is "best top speed in x secs" do the opposite
            value_selector.value = "10"
            // change the select option value of the gamemode first to __ to the default value (50)
            document.getElementById("select_first_to_value").textContent = 50
            for (let i = 0; i < best_top_options.length; i++) {
                best_top_options[i].style.display = "initial";
            }
            for (let i = 0; i < first_to_options.length; i++) {
                first_to_options[i].style.display = "none";
            }
            
        }
        // change the tutorial
        change_tutorial_automatically()
    }

});

const change_tutorial = (title_input, value_input) => {
    /*
    title = 'first to' or 'best top speed'
    value = 50, 100, 150 etc 
    */
    let title = document.getElementById("tutorial_title")
    let text = document.getElementById("tutorial_text")
    // flag that the new gamemode selection must be sent to player 2
    send_tutorial_to_player2 = true
    if (title_input == "first to") {
        // check if input is sanitary
        if (!([50, 75, 100, 125, 150, "50", "75", "100", "125", "150"].includes(value_input))) {
            console.log("bad value for change_tutorial function")
            return false
        } else { // change the tutorial title and text
            mode_type = "First to "+value_input+" clicks"
            title.innerHTML = mode_type
            text.innerHTML = "The first player to click the big button "+value_input+" times, wins the game!"
        }
    }
    else if (title_input == "best top speed") {
        // check if input is sanitary
        if (!([10, 15, 20, 25, 30, "10", "15", "20", "25", "30"].includes(value_input))) {
            console.log("bad value for change_tutorial function")
            return false
        } else { // change the tutorial title and text
            mode_type = "Best top speed in "+value_input+"s"
            title.innerHTML = mode_type
            text.innerHTML = "The player to reach the highest clicks per second at any point in time over the course of "+value_input+"s, wins the game!"
        }
    }
    
    else {
        console.log("bad title for change_tutorial function")
        return false
    }

    return true
};



// check for joined players, send and receive game state on an interval:
pfp1set = false
pfp2set = false
setInterval(() => {

    fetch(`/api/games/${game_id}/`)
    .then(response1 => response1.json())
    .then(data1 => {
        // if the db has a player_one but we dont have one locally
        if (data1.player_one && !(player1)) {
            fetch(`/api/users/${data1.player_one}/`)
            .then(response2 => response2.json())
            .then(data2 => {
                // set player1 as a local variable and set the users name in the appropriate place with their emojis
                player1 = data2
                let player1_text = document.getElementById("player1_text")
                player1_text.innerText = player1.username+" "+player1.flag_emoji+" 👑"
                // if we already generated a mini-pfp dont add another one (this was a problem on slower connections)
                if (!pfp1set) {
                    pfp1set = true
                    let pfp = default_pfp;
                    // if the user has an avatar, then set pfp as the avatar
                    if (player1.avatar != "" && player1.avatar != undefined) {
                        pfp = player1.avatar
                };
                document.getElementById("player1_user_span").insertAdjacentHTML("afterbegin", `<img class="mini_pfp" src="${pfp}" alt="profile picture">`);
                }
                twemoji.parse(document.getElementById("player1_text"), {
                    folder: 'svg',
                    ext: '.svg',
                    base: '/static/twemoji/',
                });
            });
        }
        // if the db has a player_two but we dont have one locally
        if (data1.player_two && !(player2)) {
            fetch(`/api/users/${data1.player_two}/`)
            .then(response3 => response3.json())
            .then(data3 => {
                // set player2 as a local variable and set the users name in the appropriate place with their emojis
                player2 = data3
                let player2_text = document.getElementById("player2_text")
                player2_text.innerText = player2.username+" "+player2.flag_emoji
                if (!pfp2set) {
                    pfp2set = true
                    let pfp = default_pfp;
                    if (player2.avatar != "" && player2.avatar != undefined) {
                        pfp = player2.avatar
                        
                    };
                    document.getElementById("player2_user_span").insertAdjacentHTML("afterbegin", `<img class="mini_pfp" src="${pfp}" alt="profile picture">`);
                }

                twemoji.parse(document.getElementById("player2_text"), {
                    folder: 'svg',
                    ext: '.svg',
                    base: '/static/twemoji/',
                });
            });
        }

        // if we have a local player2 set
        if (player2) {
            // if the current user is player2

            if (user_id == player2.id) {
                // disable all interactivity with gamemode selection and start button
                document.getElementById("gamemode_select").disabled = true
                document.getElementById("value_select").disabled = true
                document.getElementById("gamemode_value_div").style.display = "none"
                // parse the gamemode from the db and set the tutorial accordingly
                if (data1.mode.slice(0,8).toLowerCase() == 'first to') {
                    //"50", "75", "100", "125", "150"
                    if (data1.mode.includes("150")) {
                        mode_value = 150
                    } else if (data1.mode.includes("75")) {
                        mode_value = 75
                    } else if (data1.mode.includes("100")) {
                        mode_value = 100
                    } else if (data1.mode.includes("125")) {
                        mode_value = 125
                    } else if (data1.mode.includes("50")) {
                        mode_value = 50 }
                    change_tutorial("first to",mode_value)
                } else {
                    // "10", "15", "20", "25", "30"
                    if (data1.mode.includes("10")) {
                        mode_value = 10
                    } else if (data1.mode.includes("15")) {
                        mode_value = 15
                    } else if (data1.mode.includes("20")) {
                        mode_value = 20
                    } else if (data1.mode.includes("25")) {
                        mode_value = 25
                    } else if (data1.mode.includes("30")) {
                        mode_value = 30 }
                    change_tutorial("best top speed",mode_value)

                }
            
            }
        }
        // if player1 and player2 are set and the current user is player1
        if ((player1 && player2) && user_id == player1.id) {
            // enable the start button
            document.getElementById("start_game").disabled = false;
        }

        if (data1.started) {
            // if the game is set as started, redirect
            window.location.href = `/games/${game_id}/play`
        }

    });
    // if the current user is player1 and we need to send the selected game to the other user
    if ((typeof(player1) !== "undefined") && user_id == player1.id && send_tutorial_to_player2) {
        // set the game mode in db
        fetch(`/api/games/${game_id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                edit_field: 'mode',
                edit_replacement: mode_type
            })
        })
        .then(response => response.json())
        send_tutorial_to_player2 = false
    }

}, 3000);
