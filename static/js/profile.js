/* eslint-disable no-undef */


document.addEventListener("DOMContentLoaded", function () {

    document.getElementsByClassName("close_button")[0].onclick = () => {
        document.getElementsByClassName("overlay")[0].style.display="none"
    }

    // get the current user (viewer):
    if (typeof user_id !== 'undefined') {
    fetch(`/api/users/${user_id}/`)
        .then(response => response.json())
        .then(data => {
            if (profile_id == data.id) {
                document.getElementById("edit_button").style.display = "block"
            }
        });
    }


    // get the profile user (host):
    fetch(`/api/users/${profile_id}/`)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            // set window title
            document.title = data.username+"'s Profile"

            // populate the simple elements with host details
            // username + flag
            document.getElementById("profile_username").textContent = data.username +" "+ data.flag_emoji
            twemoji.parse(document.getElementById("profile_username"), {
                    folder: 'svg',
                    ext: '.svg',
                    base: '/static/twemoji/',
                });
            // bio
            document.getElementById("profile_bio").textContent = data.bio
            // avatar
            if (data.avatar) {
                document.getElementById("profile_image").src = data.avatar
            }
            // banner
            if (data.banner) {
            document.getElementById("banner_image").src = data.banner
            }
            // top_cps and leaderboard:
            document.getElementById("top_cps_value").textContent = data.top_cps
            /* TODO add leaderboard */


            // Get game history for user and populate game history
            fetch(`/api/games/?user_id=${profile_id}`)
            .then(response => response.json())
            .then(game_data => {
                // for each game received from server
                let counter = 0
                game_data.forEach(game => {
                    // hide 
                    if (counter == 0) {
                        document.getElementById("past_games_hint_text").style.display = "none"
                    }
                    counter++
                    if (counter == 21) {
                        throw "20 games loaded, cancelling.";
                    }
                    // get the opponent and win status (to process and display later)
                    let opponentid = undefined
                    let win = false
                    const top_cps = Math.max(game.player_one_cps, game.player_two_cps)
                    let date = new Date(game.timestamp)
                    if (game.player_one != profile_id) {
                        opponentid = game.player_one
                    } else {
                        opponentid = game.player_two
                    }
                    if (game.winning_player == profile_id) {
                        win = true
                    }
                    // fetch the opponent
                    fetch(`/api/users/${opponentid}/`)
                    .then(response => response.json())
                    .then(opponent_data => {
                        // now we have all the data, we can create the game history box in html
                        if (win) {
                            // if win:
                            document.getElementById("game_history").insertAdjacentHTML("beforeend", `
                            <div class="game_flexbox">
                                <div class="history_win_div">
                                    <p class="win_text">Win</p>
                                </div>

                                <div class="vertical_thin_bar_light"></div>

                                <div class="history_column_div">
                                    <p class="history_title">Timestamp</p>
                                    <p id="history_timestamp_date">${date.toLocaleDateString()}</p>
                                    <p id="history_timestamp_hour">${date.toLocaleTimeString()}</p>
                                </div>

                                <div class="vertical_thin_bar_light"></div>

                                <div class="history_column_div">
                                    <p class="history_title">Details</p>
                                    <p><span class="history_title">Mode - </span>${game.mode}</p>
                                    <p><span class="history_title">Opponent - </span><span class="username_with_emoji"> ${opponent_data.username} ${opponent_data.flag_emoji}</span></p>
                                    <p><span class="history_title">Top Speed - </span>${top_cps}</p>
                                </div>
                            </div>`);
                        } else {
                            // if loss:
                            document.getElementById("game_history").insertAdjacentHTML("beforeend", `
                            <div class="game_flexbox">
                                <div class="history_win_div">
                                    <p style="color: #FF0004;margin-left:-5%;" class="win_text">Loss</p>
                                </div>

                                <div class="vertical_thin_bar_light"></div>

                                <div class="history_column_div">
                                    <p class="history_title">Timestamp</p>
                                    <p id="history_timestamp_date">${date.toLocaleDateString()}</p>
                                    <p id="history_timestamp_hour">${date.toLocaleTimeString()}</p>
                                </div>

                                <div class="vertical_thin_bar_light"></div>

                                <div class="history_column_div">
                                    <p class="history_title">Details</p>
                                    <p><span class="history_title">Mode - </span>${game.mode}</p>
                                    <p><span class="history_title">Opponent - </span><span class="username_with_emoji"> ${opponent_data.username} ${opponent_data.flag_emoji}</span></p>
                                    <p><span class="history_title">Top Speed - </span>${top_cps}</p>
                                </div>
                            </div>`);
                        }

                    });
                });
            });
        });

    // parse flag emojis after 2.5secs
    setTimeout(function() {
        twemoji.parse(document.getElementById("game_history"), {
            folder: 'svg',
            ext: '.svg',
            base: '/static/twemoji/',
        });
    }, 2500);
    
    // set button onclick functions
    document.getElementById("edit_button").onclick = () => {
        document.getElementsByClassName("overlay")[0].style.display = "flex"
    }
    document.getElementById("popup_confirm_button").onclick = () => {
        document.getElementsByClassName("overlay")[0].style.display = "none"
    }

});
