document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("login_button").onclick = function () {
        window.location.href = "/login/";
    };
    document.getElementById("home_button").onclick = function () {
        window.location.href = "/";
    };
    document.getElementById("leaderboards_button").onclick = function () {
        window.location.href = "/leaderboard";
    };
});
