/* eslint-disable no-undef */
// global variables
// general game details
let game_base_state;
let mode_type;
let mode_value;

// real-time game details
let clicks_remaining = 0
let secs_remaining = 30
let counter = 0;
let firstClick;
let currentClick;
let cps;
let top_cps = 0;

// timers
let start_time;
let button_unlock_timer;
let game_refresh_interval;


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

// function to set all game timers, for updating game info etc
const set_timers = () => { 
    setInterval(() => {
        if (secs_remaining>0) { // update secs remaining countdown
            secs_remaining--
            document.getElementById("time_remaining").textContent = secs_remaining
        } else { // if 0 seconds remaining

        }
        if (counter > 1) { // update click speed
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
            document.getElementById("cps").innerText = "clicks per second: 0";
            }
        }, 500);

    // reset cps to 0 every 5 seconds so the cps doesn't stagnate over a long period of time
    setInterval(() => {
        counter = 0;
        cps = 0;
        firstClick = null;
    }, 5083);

    // update game information, check if player has won and refresh co-op click counter
    game_refresh_interval = setInterval(() => {
        // send current info
        // send info for player one
        if (game_base_state.player_one == user_id) {
            // update clicks
            fetch(`/api/games/${game_id}/`, {
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
            fetch(`/api/games/${game_id}/`, {
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
            fetch(`/api/games/${game_id}/`, {
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
            fetch(`/api/games/${game_id}/`, {
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
        // get recent info and update DOM
        fetch(`/api/games/${game_id}/`)
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
        // check if anyone won yet
        check_and_set_win_state()
    }, 2000);
}


const check_and_set_win_state = () => {
    // get the game state from database
    fetch(`/api/games/${game_id}/`)
        .then(response => response.json())
        .then(data => {

            /* // if there is a winning player, set their click count and bar to max (to try and negate sync issues)
            if (data.winning_player == data.player1 && mode_type == "first to") {
                document.getElementById("player_one_progress_div").style.height = "0%"
                document.getElementById("player_one_clicks").textContent = mode_value
            } else if (data.winning_player == data.player2 && mode_type == "first to") {
                document.getElementById("player_two_progress_div").style.height = "0%"
                document.getElementById("player_two_clicks").textContent = mode_value
            } */

            // if there is a winning player, and it is the current player
            if (data.winning_player == user_id) {
                // stop any further game updates
                clearInterval(game_refresh_interval)
                // player won html box
                document.getElementsByClassName("overlay")[0].style.display = "flex"
            }
            // if there is a winning player, and it is NOT the current player
            else if (data.winning_player != user_id && data.winning_player) {
                // stop any further game updates
                clearInterval(game_refresh_interval)
                // player lost html box
                document.getElementById("win_status").textContent = "You lost."
                document.getElementsByClassName("overlay")[0].style.display = "flex"
            }
            // Otherwise, if there is no winning player and there is no time remaining:
            else if (secs_remaining == 0) {
                if (mode_type == "first to") {
                    // if player 1 had more clicks
                    if (data.player_one_clicks > data.player_two_clicks) {
                        // if the current user is player 1, show win msg and update game data
                        if (data.player_one != user_id) {
                            document.getElementById("win_status").textContent = "You lost."
                        }
                        document.getElementsByClassName("overlay")[0].style.display = "flex"
                        fetch(`/api/games/${game_id}/`, {
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
                    } else { // (player 1 lost):
                        // if the current user is player 1 (the loser)
                        if (data.player_two != user_id) {
                            // show loss msg
                            document.getElementById("win_status").textContent = "You lost."
                        }
                        document.getElementsByClassName("overlay")[0].style.display = "flex"
                        // update win status in db
                        fetch(`/api/games/${game_id}/`, {
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
                    // game is finished so end all game refreshes.
                    clearInterval(game_refresh_interval)
                } else if (mode_type == "best top speed") {
                    // if the mode is best top speed do the same as before but compare cps instead of clicks. 
                    // please refer to the comments above
                    if (data.player_one_cps > data.player_two_cps) {
                        if (data.player_one != user_id) {
                            document.getElementById("win_status").textContent = "You lost."
                        }
                        document.getElementsByClassName("overlay")[0].style.display = "flex"
                        fetch(`/api/games/${game_id}/`, {
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
                        fetch(`/api/games/${game_id}/`, {
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
            // if the mode is first to and current user reaches 0 clicks remaining, register them as the winner in db
            else if (mode_type == "first to" && clicks_remaining < 1) {
                document.getElementsByClassName("overlay")[0].style.display = "flex"
                    fetch(`/api/games/${game_id}/`, {
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


// Once the game has loaded, do this:
document.addEventListener("DOMContentLoaded", function () {
    // set "you won" or "you lost" button to redirect to home
    document.getElementById("popup_confirm_button").onclick = () => {
        window.location.href = "/"
    }
    // cps button set onclick
    document.getElementsByClassName("cps_button")[0].onclick = function () {
        click()
    }
    // initially disable the cps button while the countdown goes down.
    document.getElementsByClassName("cps_button")[0].disabled = true
    fetch(`/api/games/${game_id}/`)
    .then(response => response.json())
    .then(data => {
        // get the initial game details, mode and players etc.
        game_base_state = data
        // parse the mode and value and set the global variables and change the DOM accordingly
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
        // initialize the game
        initialize_game()
    });

    

});

const initialize_game = () => {
    // change the DOM based on the game mode
    if (mode_type == "first to") {
        document.getElementById("main_game_stat_title").innerHTML = 'Clicks remaining: <span id="main_game_stat">0</span>'
        document.getElementById("main_game_stat").innerText = mode_value
    } else if (mode_type == "best top speed") {
        document.getElementById("main_game_stat_title").innerHTML = 'Best click speed: <span id="main_game_stat">0</span>'
    }
    
    // write the usernames and their flags below the progress bars:
    fetch(`/api/users/${game_base_state.player_one}/`)
            .then(response => response.json())
            .then(data => {
                let player1 = data
                document.getElementById("player_one_name").innerText = player1.username+" "+player1.flag_emoji
                // eslint-disable-next-line no-undef
                twemoji.parse(document.getElementById("player_one_name"), {
                    folder: 'svg',
                    ext: '.svg',
                    base: '/static/twemoji/',
                });
            });
    fetch(`/api/users/${game_base_state.player_two}/`)
            .then(response => response.json())
            .then(data => {
                let player2 = data
                document.getElementById("player_two_name").innerText = player2.username+" "+player2.flag_emoji
                // eslint-disable-next-line no-undef
                twemoji.parse(document.getElementById("player_two_name"), {
                    folder: 'svg',
                    ext: '.svg',
                    base: '/static/twemoji/',
                });
            });
    

    // start the countdown timer
    const countdown_timer = setInterval(() => {
        // if no local start time exists:
        if (start_time == undefined || start_time == null) {
            fetch(`/api/games/${game_id}/`)
            .then(response => response.json())
            .then(data => {
                if (data.timestamp) {
                    // attempt to get the start time from the database
                    start_time = new Date(data.timestamp);
                } else { // if it doesnt exist do:
                    // player 1 sets the timestamp/start_time
                    if ((start_time == undefined || start_time == null) && user_id == game_base_state.player_one) {
                        fetch(`/api/games/${game_id}/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': getCookie('csrftoken')
                            },
                            body: JSON.stringify({
                                edit_field: 'timestamp',
                                edit_replacement: new Date(Date.now() + 6000) // set the start time 6 seconds from now
                            })
                        })
                    }
                }
                
            });
        }
        
        // if a local start time exists
        if (start_time)  {
            // write the countdown on the button
            button_unlock_timer = -Math.trunc((Date.now()-start_time) / 1000);
            document.getElementById("button_unlock_timer").textContent = button_unlock_timer+"..."
        }

        // if the countdown is over:
        if (button_unlock_timer <= 0) {
            // enable the cps button and write the correct text on the button.
            document.getElementsByClassName("cps_button")[0].disabled = false
            document.getElementsByClassName("cps_button")[0].textContent = "Click me!"
            // clear the countdown timer
            clearInterval(countdown_timer)
            // set the remaining time left for the game based on the start_time
            secs_remaining = secs_remaining - Math.trunc((Date.now()-start_time) / 1000)
            // set the game timers
            set_timers()
        }

        
    }, 250);


}


// function for the cps button
const click = () => {
    currentClick = new Date().getTime();
    // add to the click amount variable
    counter++
    // remove from the click remaining variable
    if (clicks_remaining > 0) {
        clicks_remaining--
    }
    // check if someone has won yet
    check_and_set_win_state()
    // set the clicks_remaining text in the DOM if the mode applies
    if (mode_type == "first to") {
        document.getElementById("main_game_stat").innerText = clicks_remaining
    }
    // if this is the users first click, set the cps to 1.
    if (counter == 1){
        firstClick = new Date().getTime();
        document.getElementById("cps").innerText = "clicks per second: "+ 1.00
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
    } else { // if this is just a regular click somewhere inbetween change the cps accordingly and set the clicks remaining
        cps = ((counter / (currentClick-firstClick))*1000)
        document.getElementById("cps").innerText = "clicks per second: " + Math.round(cps*100)/100
        // attempt to set the users record CPS if applies.
        setRecord(cps)
    }

}



function setRecord(cps) {
    // if the current cps is higher than the users historic top cps FOR THE CURRENT GAME ONLY
    if (top_cps < cps) {
        top_cps = Math.round(cps*100)/100
        if (mode_type == "best top speed") {
            // set the new top_cps in the DOM
            document.getElementById("main_game_stat").innerHTML = top_cps
        }
    }
    
    // compare with global top_cps
    fetch(`/api/users/${user_id}/`)
    .then(response => response.json())
    .then(data => {
        // if the users current game top_cps is higher than the users historic top_cps for all games, set a record in the db
        if (top_cps > data.top_cps) {
            // set the cps number
            fetch(`/api/users/${user_id}/`, {
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
            // set the game id to link the record
            fetch(`/api/users/${user_id}/`, {
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