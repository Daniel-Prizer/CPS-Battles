/* eslint-disable no-undef */
// When page has loaded
document.addEventListener("DOMContentLoaded", function () {
    let counter = 0
    users_json.forEach(user => {
        counter++
        let pfp = default_pfp;
        if (user.avatar != "") {
            pfp = user.avatar.startsWith('/media/') ? user.avatar : '/media/' + user.avatar;
        }
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

        // parse flag emojis after 1secs
    setTimeout(function() {
        twemoji.parse(document.getElementById("leaderboard_list"), {
            folder: 'svg',
            ext: '.svg',
            base: '/static/twemoji/',
        });
    }, 1000);
});