from django.shortcuts import render
import json
from DataLayer.API import DataLayerAPI

# Create your views here.
def homepage(request):

    if request.method == "POST":
        api = DataLayerAPI()
        data = json.loads(request.body)
        top_cps = data.get("top_cps")
        username = request.user.username
        print(username,"<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
        user_id = api.get_user_by_username(username)["id"]

        game = api.register_game(
            player_one = user_id,
            player_one_cps = top_cps,
            player_two = None,
            player_two_cps = None,
            mode = "Homepage"
            )
        api.edit_user(user_id,"top_cps_game_id",game["game_id"])
        api.edit_user(user_id,"top_cps",top_cps)
    

    return render(request, 'homepage/home.html')