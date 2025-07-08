from django.shortcuts import render
from django.shortcuts import redirect
from django.shortcuts import get_object_or_404
from .models import Games
from DataLayer.API import DataLayerAPI
from django.http import JsonResponse
import json



api = DataLayerAPI()

def create_game(request):
    # dont allow the creation of a game unless the user is logged in
    if not request.user.is_authenticated:
        return redirect('/login')
    # create the game in the db
    game = api.register_game(
        player_one=request.user.id,
        player_one_cps=0,
        player_two=None,
        player_two_cps=None,
        mode="unknown",
        )
    return redirect('join_game', game_id=game["game_id"])


def render_game(request, game_id):
    return render(request, 'games/gameplay.html', {"game_id": game_id})


def join_game(request, game_id):

    game = get_object_or_404(Games, game_id=game_id)

    # if the game is filled with players and the person loading the page isnt one of the players, show an error page
    if game.player_two and game.player_one and game.player_two != request.user and game.player_one != request.user:
        return render(request, "games/full.html")

    # if there is no player two, and the person joining isnt player one, add the current user as player two
    elif not game.player_two and game.player_one != request.user:
        if request.user.id:
            api.edit_game(game.game_id,"player_two",request.user.id)
        else:
            return redirect("/login/")
    
    # if the game has started, render the gameplay page
    elif game.player_two and game.player_one and game.started:
        return render(request, 'games/gameplay.html', {"game_id": game_id})

    return render(request, 'games/session.html', {"game_id": game_id})

def get_game(request, game_id):
    game = api.get_game(game_id)
    return JsonResponse(game)

def get_games_for_user(request, user_id):
    game = api.get_games_for_user_id(user_id)
    return JsonResponse(game, safe=False)


def edit_game(request, game_id):
    # expects edit field to be one of the ones listed under api.py
    if request.method == "POST":
        game_data = api.get_game(game_id)
        data = json.loads(request.body)
        edit_field = data.get("edit_field")
        edit_replacement = data.get("edit_replacement")
        # if the person trying to edit the game isnt one of the players, do not edit.
        if game_data["player_two"]:
            if int(game_data["player_two"]) != int(request.user.id) and int(game_data["player_one"]) != int(request.user.id):
                return JsonResponse({"error": "Only players registered to the game can edit the game"}, status=403)
        else:
            if int(game_data["player_one"]) != int(request.user.id):
                return JsonResponse({"error": "Only players registered to the game can edit the game"}, status=403)
        # dont allow the players to be changed after players are already assigned to the game
        if (game_data["player_two"] and game_data["player_one"]) and (edit_field == "player_one" or edit_field == "player_Two"):
            return JsonResponse({"error": "The game already has assigned players"}, status=403)
        # allow request to use current user as a replacement
        if edit_replacement == "current_user":
            edit_replacement = request.user.id
        return JsonResponse(api.edit_game(game_id, edit_field, edit_replacement))
    else:
        return JsonResponse({"error": "Only POST allowed"}, status=405)
