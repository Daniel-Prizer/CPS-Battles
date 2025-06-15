let send_tutorial_to_player2 = false
let player1 = undefined
let player2 = undefined
let mode_type = "First to 100 clicks"

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


document.addEventListener("DOMContentLoaded", function () {
    value_selector = document.getElementById("value-select")
    value_selector.value = "50"
    change_tutorial("first to", "50")
    game_selector = document.getElementById("gamemode-select")
    document.getElementById("game_link").value = window.location.href
    document.getElementById("start_game").onclick = () => {
        
        fetch(`/api/game/${game_id}/`, {
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
        .then(data => {
            console.log(data);
        });


        document.getElementById("start_game").disabled = true;
    }
    copy_button = document.getElementById("copy_link_button")
    copy_button.onclick = () => {
    const copyText = document.getElementById("game_link");

    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices

    navigator.clipboard.writeText(copyText.value);

    copy_button.innerHTML = "Copy ✅"

    }


    const best_top_options = document.getElementsByClassName("best_top_values");
    for (let i = 0; i < best_top_options.length; i++) {
        best_top_options[i].style.display = "none";
    }


    const change_tutorial_automatically = () => {
        let title = 'first to'
        if (game_selector.value.slice(0,8).toLowerCase() == 'first to') {
            title = 'first to'
        } else {
            title = 'best top speed'
        }
        change_tutorial(title,value_selector.value)
    }


    value_selector.onchange = () => {
        change_tutorial_automatically()
    }



    game_selector.onchange = () => {
        const first_to_options = document.getElementsByClassName("first_to_values");
        const best_top_options = document.getElementsByClassName("best_top_values");


        if (game_selector.value.slice(0,8).toLowerCase() == 'first to') {
            value_selector.value = "50"
            for (let i = 0; i < best_top_options.length; i++) {
                best_top_options[i].style.display = "none";
            }
            for (let i = 0; i < first_to_options.length; i++) {
                first_to_options[i].style.display = "initial";
            }
        } else {
            value_selector.value = "10"
            for (let i = 0; i < best_top_options.length; i++) {
                best_top_options[i].style.display = "initial";
            }
            for (let i = 0; i < first_to_options.length; i++) {
                first_to_options[i].style.display = "none";
            }
            
        }
        change_tutorial_automatically()
    }

});

const change_tutorial = (title_input, value_input) => {
    /*
    title = 'first to' or 'best top speed'
    value = 50, 100, 150 etc 
    */
    title = document.getElementById("tutorial_title")
    text = document.getElementById("tutorial_text")
    send_tutorial_to_player2 = true
    if (title_input == "first to") {
        if (!([50, 75, 100, 125, 150, "50", "75", "100", "125", "150"].includes(value_input))) {
            console.log("bad value for change_tutorial function")
            return false
        } else {
            mode_type = "First to "+value_input+" clicks"
            title.innerHTML = mode_type
            text.innerHTML = "The first player to click the big button "+value_input+" times, wins the game!"
        }
    }
    else if (title_input == "best top speed") {
        if (!([10, 15, 20, 25, 30, "10", "15", "20", "25", "30"].includes(value_input))) {
            console.log("bad value for change_tutorial function")
            return false
        } else {
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




const poll_for_players = setInterval(() => {
    fetch(`/api/get_game/${game_id}/`)
    .then(response1 => response1.json())
    .then(data1 => {
        console.log("-> poll for players");
        if (data1.player_one && !(player1)) {
            fetch(`/api/get_user/${data1.player_one}/`)
            .then(response2 => response2.json())
            .then(data2 => {
                player1 = data2
                player1_text = document.getElementById("player1_text")
                player1_text.innerText = player1.username+" "+player1.flag_emoji+" 👑"
                twemoji.parse(document.getElementById("player1_text"), {
                    folder: 'svg',
                    ext: '.svg',
                    base: '/static/twemoji/',
                });
            });
        }

        if (data1.player_two && !(player2)) {
            fetch(`/api/get_user/${data1.player_two}/`)
            .then(response3 => response3.json())
            .then(data3 => {
                player2 = data3
                player2_text = document.getElementById("player2_text")
                player2_text.innerText = player2.username+" "+player2.flag_emoji
                twemoji.parse(document.getElementById("player2_text"), {
                    folder: 'svg',
                    ext: '.svg',
                    base: '/static/twemoji/',
                });
            });
        }

        if (player2) {
            if (user_id == player2.id) {
                document.getElementById("gamemode-select").disabled = true
                document.getElementById("value-select").disabled = true
                document.getElementById("gamemode-value-div").style.display = "none"
                console.log(data1)
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

        if ((player1 && player2) && user_id == player1.id) {
            document.getElementById("start_game").disabled = false;
        }

        if (data1.started) {
            window.location.href = `/game/${game_id}/play`
        }

    });
        if (user_id == player1.id && send_tutorial_to_player2) {
        fetch(`/api/game/${game_id}/`, {
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
        .then(data => {
            console.log(data);
            send_tutorial_to_player2 = false
        });
    }

}, 1000);
