// once the DOM has loaded, get the users country and set it into the register form.
document.addEventListener("DOMContentLoaded", function () {
    fetch('https://ipapi.co/json/')
    .then(res => res.json())
    .then(data => {
        document.getElementById('id_country_code').value = data.country;
    })
    .catch(() => {
        document.getElementById('id_country_code').value = undefined;
    });
});





