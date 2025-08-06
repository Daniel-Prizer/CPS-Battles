/* eslint-disable no-undef */
// global variables
// general game details
let game_base_state;
let mode_type;
let mode_value;
let time_offset = 0;

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
            // show loading screen for who won
            document.getElementsByClassName("overlay")[0].style.display = "flex"
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

            // -- SET WINNER OVERLAY DIALOGUE IF A WINNER EXISTS IN DB --
            // if there is a winning player, and it is the current player
            if (data.winning_player == user_id && data.winning_player) {
                // stop any further game updates
                clearInterval(game_refresh_interval)
                // player won html box
                document.getElementById("win_status").textContent = "You won!"
                document.getElementById("popup_confirm_button").disabled = false
                document.getElementsByClassName("overlay")[0].style.display = "flex"
            }
            // if there is a winning player, and it is NOT the current player
            else if (data.winning_player != user_id && data.winning_player) {
                // stop any further game updates
                clearInterval(game_refresh_interval)
                // player lost html box
                document.getElementById("win_status").textContent = "You lost."
                document.getElementById("popup_confirm_button").disabled = false
                document.getElementsByClassName("overlay")[0].style.display = "flex"
            }
            // -- THERE IS NO WINNER IN DB, CHECK IF CURRENT USER MEETS REQUIREMENTS TO WIN --
            // else if there is no winning player and the game is still ongoing + only allow player1 (host) to edit game
            else if ((!data.winning_player && secs_remaining > 0) && data.player_one == user_id) {
                if(mode_type == "first to") {
                    // if player one has maxed his clicks, set him as the winner
                    if (data.player_one_clicks >= mode_value) {
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
                        // if player two has maxed his clicks, set him as the winner
                    } else if (data.player_two_clicks >= mode_value) {
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
                } // THERE IS NO CHECK FOR BEST TOP SPEED CUS THAT IS DONE ONCE TIMER IS OVER, THIS IS WHEN SECS_REMAINING > 0
                
                // there is no winning player, yet the game has finished. player one edits the game to find winner:
            } else if ((!data.winning_player && secs_remaining <= 0) && data.player_one == user_id) {
                if(mode_type == "first to") {
                    // if player one has higher clicks, set him as winner.
                    if (data.player_one_clicks > data.player_two_clicks) {
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
                    } else {  //else set player2 as winner.
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
                } else { // mode is top speed so we check cps instead of clicks
                    // if player one has higher cps, set him as winner.
                    if (data.player_one_cps > data.player_two_cps) {
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
                    } else {  //else set player2 as winner.
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
                }
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

function start_countdown() {
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
                        const server_now = Date.now() + time_offset;
                        const nine_seconds_later = new Date(server_now + 9000); // set the start time 9 seconds from now

                        fetch(`/api/games/${game_id}/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': getCookie('csrftoken')
                            },
                            body: JSON.stringify({
                                edit_field: 'timestamp',
                                edit_replacement: nine_seconds_later.toISOString() // send in ISO format
                            })
                        });
                    }
                }
            });
        }

        // if a local start time exists
        if (start_time)  {
            // write the countdown on the button
            const now = Date.now() + time_offset;
            button_unlock_timer = -Math.trunc((now - start_time.getTime()) / 1000);
            document.getElementById("button_unlock_timer").textContent = button_unlock_timer + "...";
        }

        // if the countdown is over:
        if (button_unlock_timer <= 0) {
            // enable the cps button and write the correct text on the button.
            document.getElementsByClassName("cps_button")[0].disabled = false;
            document.getElementsByClassName("cps_button")[0].textContent = "Click me!";
            // clear the countdown timer
            clearInterval(countdown_timer);
            // set the remaining time left for the game based on the start_time
            const now = Date.now() + time_offset;
            secs_remaining = secs_remaining - Math.trunc((now - start_time.getTime()) / 1000);
            // set the game timers
            set_timers();
        }
    }, 250);
}




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
                if (player1.avatar) {
                    document.getElementById("player_one_pfp").src = player1.avatar
                }
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
                if (player2.avatar) {
                    document.getElementById("player_two_pfp").src = player2.avatar
                }
                twemoji.parse(document.getElementById("player_two_name"), {
                    folder: 'svg',
                    ext: '.svg',
                    base: '/static/twemoji/',
                });
            });
    

    fetch("/api/server-time/")
    .then(res => res.json())
    .then(data => {
        const serverTime = new Date(data.server_time).getTime();
        const clientTime = Date.now();
        time_offset = serverTime - clientTime;
        // Start the countdown
        start_countdown();
    });
}


// function for the cps button
const click = () => {
    currentClick = new Date().getTime();
    // add to the click amount variable
    counter++
    // remove from the click remaining variable
    if (clicks_remaining > 0) {
        clicks_remaining--
    } else if (!(mode_type == 'best top speed')) {
        // show loading screen for who on
        document.getElementsByClassName("overlay")[0].style.display = "flex"
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