let game_base_state = undefined
let mode_type = undefined
let mode_value = undefined

let clicks_remaining = 0
let secs_remaining = 30

let counter = 0;
let firstClick;
let currentClick;
let cps;
let top_cps = 0;

let start_time = undefined
let button_unlock_timer = undefined

let = game_refresh_interval = undefined

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

const set_timers = () => { 
    // update click speed every second and secs remaining
    setInterval(() => {
        if (secs_remaining>0) {
            secs_remaining--
            document.getElementById("time_remaining").textContent = secs_remaining
        } else { // if 0 seconds remaining

        }
        if (counter > 1) {
            cps = ((counter / (new Date().getTime()-firstClick))*1000)
            document.getElementById("cps").innerText = "clicks per second: " + Math.round(cps*100)/100
            setRecord(cps)
            }
        }, 1000);

    
    // set click speed to 0 if inactive
    setInterval(() => {
        if (currentClick && new Date().getTime() - currentClick >= 1750) {
            counter = 0;
            firstClick = null;
            lastClickTime = null;
            document.getElementById("cps").innerText = "clicks per second: 0";
            }
        }, 500);

    // update game information, check if player has won and refresh co-op click counter
    game_refresh_interval = setInterval(() => {
        // send current info
        // send info for player one
        if (game_base_state.player_one == user_id) {
            // update clicks
            fetch(`/api/game/${game_id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    edit_field: 'player_one_clicks',
                    edit_replacement: mode_value-clicks_remaining
                })
            })
            // update cps
            fetch(`/api/game/${game_id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    edit_field: 'player_one_cps',
                    edit_replacement: top_cps
                })
            })
        } // send info for player two 
        else {
            // update clicks
            fetch(`/api/game/${game_id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    edit_field: 'player_two_clicks',
                    edit_replacement: mode_value-clicks_remaining
                })
            })
            // update cps
            fetch(`/api/game/${game_id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    edit_field: 'player_two_cps',
                    edit_replacement: top_cps
                })
            })  
        }
        // get recent info
        fetch(`/api/get_game/${game_id}/`)
        .then(response => response.json())
        .then(data => {
            if (mode_type == "first to") {
                document.getElementById("player_one_clicks").textContent = data.player_one_clicks
                document.getElementById("player_two_clicks").textContent = data.player_two_clicks
                let player_one_percent = (100 - ((data.player_one_clicks) / mode_value) * 100) + "%";
                document.getElementById("player_one_progress_div").style.height = player_one_percent
                let player_two_percent = (100 - ((data.player_two_clicks) / mode_value) * 100) + "%";
                document.getElementById("player_two_progress_div").style.height = player_two_percent
            } else if ( mode_type == "best top speed") {
                document.getElementById("player_one_clicks").textContent = data.player_one_cps
                document.getElementById("player_two_clicks").textContent = data.player_two_cps
                let player_one_percent = (100 - ((data.player_one_cps) / 75) * 100) + "%";
                document.getElementById("player_one_progress_div").style.height = player_one_percent
                let player_two_percent = (100 - ((data.player_two_cps) / 75) * 100) + "%";
                document.getElementById("player_two_progress_div").style.height = player_two_percent
            }
        });

        check_and_set_win_state()
    }, 500);
}


const check_and_set_win_state = () => {
    fetch(`/api/get_game/${game_id}/`)
        .then(response => response.json())
        .then(data => {
            if (data.winning_player == user_id) {
                clearInterval(game_refresh_interval)
                document.getElementsByClassName("overlay")[0].style.display = "flex"
            }
            else if (data.winning_player != user_id && data.winning_player) {
                clearInterval(game_refresh_interval)
                document.getElementById("win_status").textContent = "You lost."
                document.getElementsByClassName("overlay")[0].style.display = "flex"
            }
            else if (secs_remaining == 0) {
                if (mode_type == "first to") {
                    if (data.player_one_clicks > data.player_two_clicks) {
                        if (data.player_one != user_id) {
                            document.getElementById("win_status").textContent = "You lost."
                        }
                        document.getElementsByClassName("overlay")[0].style.display = "flex"
                        fetch(`/api/game/${game_id}/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': getCookie('csrftoken')
                            },
                            body: JSON.stringify({
                                edit_field: 'winning_player',
                                edit_replacement: data.player_one
                            })
                        })
                    } else {
                        if (data.player_two != user_id) {
                            document.getElementById("win_status").textContent = "You lost."
                        }
                        document.getElementsByClassName("overlay")[0].style.display = "flex"
                        fetch(`/api/game/${game_id}/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': getCookie('csrftoken')
                            },
                            body: JSON.stringify({
                                edit_field: 'winning_player',
                                edit_replacement: data.player_two
                            })
                        })
                    }
                    clearInterval(game_refresh_interval)
                } else if (mode_type == "best top speed") {
                    if (data.player_one_cps > data.player_two_cps) {
                        if (data.player_one != user_id) {
                            document.getElementById("win_status").textContent = "You lost."
                        }
                        document.getElementsByClassName("overlay")[0].style.display = "flex"
                        fetch(`/api/game/${game_id}/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': getCookie('csrftoken')
                            },
                            body: JSON.stringify({
                                edit_field: 'winning_player',
                                edit_replacement: data.player_one
                            })
                        })
                    } else {
                        if (data.player_two != user_id) {
                            document.getElementById("win_status").textContent = "You lost."
                        }
                        document.getElementsByClassName("overlay")[0].style.display = "flex"
                        fetch(`/api/game/${game_id}/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': getCookie('csrftoken')
                            },
                            body: JSON.stringify({
                                edit_field: 'winning_player',
                                edit_replacement: data.player_two
                            })
                        })
                    }
                    clearInterval(game_refresh_interval)
                }
            }
            else if (mode_type == "first to" && clicks_remaining == 0) {
                document.getElementsByClassName("overlay")[0].style.display = "flex"
                    fetch(`/api/game/${game_id}/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        body: JSON.stringify({
                            edit_field: 'winning_player',
                            edit_replacement: "current_user"
                        })
                    })
            }
        });
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("popup_confirm_button").onclick = () => {
        window.location.href = "/"
    }
    document.getElementsByClassName("cps_button")[0].onclick = function () {
        click()
    }
    document.getElementsByClassName("cps_button")[0].disabled = true
    fetch(`/api/get_game/${game_id}/`)
    .then(response => response.json())
    .then(data => {
        game_base_state = data
        console.log(game_base_state)

        if (game_base_state.mode.slice(0,8).toLowerCase() == 'first to') {
            mode_type = 'first to'
            //"50", "75", "100", "125", "150"
            if (game_base_state.mode.includes("150")) {
                mode_value = 150
            } else if (game_base_state.mode.includes("75")) {
                mode_value = 75
            } else if (game_base_state.mode.includes("100")) {
                mode_value = 100
            } else if (game_base_state.mode.includes("125")) {
                mode_value = 125
            } else if (game_base_state.mode.includes("50")) {
                mode_value = 50 }
            clicks_remaining = mode_value
        } else {
            mode_type = 'best top speed'
            // "10", "15", "20", "25", "30"
            if (game_base_state.mode.includes("10")) {
                mode_value = 10
            } else if (game_base_state.mode.includes("15")) {
                mode_value = 15
            } else if (game_base_state.mode.includes("20")) {
                mode_value = 20
            } else if (game_base_state.mode.includes("25")) {
                mode_value = 25
            } else if (game_base_state.mode.includes("30")) {
                mode_value = 30 }
            secs_remaining = mode_value
        }

        initialize_game()
    });

    

});

const initialize_game = () => {
    if (mode_type == "first to") {
        document.getElementById("main_game_stat_title").innerHTML = 'Clicks remaining: <span id="main_game_stat">0</span>'
        document.getElementById("main_game_stat").innerText = mode_value
    } else if (mode_type == "best top speed") {
        document.getElementById("main_game_stat_title").innerHTML = 'Best click speed: <span id="main_game_stat">0</span>'
    }
    
    fetch(`/api/get_user/${game_base_state.player_one}/`)
            .then(response => response.json())
            .then(data => {
                player1 = data
                document.getElementById("player_one_name").innerText = player1.username+" "+player1.flag_emoji
                twemoji.parse(document.getElementById("player_one_name"), {
                    folder: 'svg',
                    ext: '.svg',
                    base: '/static/twemoji/',
                });
            });
    fetch(`/api/get_user/${game_base_state.player_two}/`)
            .then(response => response.json())
            .then(data => {
                player2 = data
                document.getElementById("player_two_name").innerText = player2.username+" "+player2.flag_emoji
                twemoji.parse(document.getElementById("player_two_name"), {
                    folder: 'svg',
                    ext: '.svg',
                    base: '/static/twemoji/',
                });
            });
    
    const countdown_timer = setInterval(() => {
        // if no start time exists, create the start time if the user is the leader.
        if (start_time == undefined || start_time == null) {
            fetch(`/api/get_game/${game_id}/`)
            .then(response => response.json())
            .then(data => {
                if (data.timestamp) {
                    start_time = new Date(data.timestamp);
                } else {
                    if ((start_time == undefined || start_time == null) && user_id == game_base_state.player_one) {
                        fetch(`/api/game/${game_id}/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': getCookie('csrftoken')
                            },
                            body: JSON.stringify({
                                edit_field: 'timestamp',
                                edit_replacement: new Date(Date.now() + 6000)
                            })
                        })
                    }
                }
                
            });
        }

        if (start_time)  {
        button_unlock_timer = -Math.trunc((Date.now()-start_time) / 1000);
        document.getElementById("button_unlock_timer").textContent = button_unlock_timer+"..."
        console.log(button_unlock_timer)
        }

        if (button_unlock_timer <= 0) {
            document.getElementsByClassName("cps_button")[0].disabled = false
            document.getElementsByClassName("cps_button")[0].textContent = "Click me!"
            clearInterval(countdown_timer)
            secs_remaining = secs_remaining - Math.trunc((Date.now()-start_time) / 1000)
            set_timers()
        }

        
    }, 250);


}



function click() {
    counter++
    clicks_remaining--
    check_and_set_win_state()
    if (mode_type == "first to") {
        document.getElementById("main_game_stat").innerText = clicks_remaining
    }
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



function setRecord(cps) {
    console.log(top_cps,cps,typeof(top_cps),typeof(cps))
    if (top_cps < cps) {
        top_cps = Math.round(cps*100)/100
        if (mode_type == "best top speed") {
            document.getElementById("main_game_stat").innerHTML = top_cps
        }
    }
    
    // compare with global top_cps
    fetch(`/api/get_user/${user_id}/`)
    .then(response => response.json())
    .then(data => {
        if (top_cps > data.top_cps) {
            fetch(`/api/user/${user_id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    edit_field: 'top_cps',
                    edit_replacement: top_cps
                })
            })
            fetch(`/api/user/${user_id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    edit_field: 'top_cps_game_id',
                    edit_replacement: game_id
                })
            })
        }
    });

}