let game_base_state = undefined
let mode_type = undefined
let mode_value = undefined


document.addEventListener("DOMContentLoaded", function () {

    fetch(`/api/get_game/${game_id}/`)
    .then(response => response.json())
    .then(data => {
        game_base_state = data

        if (game_base_state.mode.slice(0,8).toLowerCase() == 'first to') {
            mode_type = 'first to'
        } else {
            mode_value = 'best top speed'
        }

        initialize_game()

    });

    

});

const initialize_game = () => {

}
