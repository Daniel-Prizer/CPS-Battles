/* eslint-disable no-undef */
// When page has loaded
document.addEventListener("DOMContentLoaded", function () {
    let counter = 0
    // for each user given to us through django pagination
    users_json.forEach(user => {
        // increment counter (for pos)
        counter++
        // start with pfp being default_pfp
        let pfp = default_pfp;
        // if the user has an avatar, then set pfp as the avatar
        if (user.avatar != "" && user.avatar != undefined) {
            pfp = "https://cpsbattlesstorage.blob.core.windows.net/media/"+user.avatar
        };
        // append the user to the leaderboard
        document.getElementById("leaderboard_list").insertAdjacentHTML("beforeend", `
    <div class="leaderboard_item">
        <p class="pos_item">${(page_num-1)*(10)+counter}.</p>
        <p class="speed_item">${user.top_cps} CPS</p>
        <img class="mini_pfp" src="${pfp}" alt="profile picture">
        <p class="user_item">
            <a href="/user/${user.id}" style="color:inherit;text-decoration:underline;">${user.username}</a> ${user.flag_emoji}
        </p>
    </div>
    <div class="horizontal_thin_dark_bar"></div>
        `);
    });

    // parse flag emojis
    twemoji.parse(document.getElementById("leaderboard_list"), {
        folder: 'svg',
        ext: '.svg',
        base: '/static/twemoji/',
    });
});