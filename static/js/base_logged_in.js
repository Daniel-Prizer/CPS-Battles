document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("profile_button").onclick = function () {
        // eslint-disable-next-line no-undef
        window.location.href = `/user/${user_id}/`;
    };
    document.getElementById("home_button").onclick = function () {
        window.location.href = "/";
    };
    document.getElementById("leaderboards_button").onclick = function () {
        window.location.href = "/leaderboard";
    };
});
