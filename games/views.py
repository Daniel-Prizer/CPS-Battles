from django.shortcuts import render
from django.shortcuts import redirect
from django.shortcuts import get_object_or_404, render
from .models import Games
from DataLayer.API import DataLayerAPI

def create_game(request):

    api = DataLayerAPI()
    if not request.user.is_authenticated:
        return redirect('/login')
    
    game = api.register_game(
        player_one=request.user.id,
        player_one_cps=0,
        player_two=None,
        player_two_cps=None,
        mode="unknown",
        active=True
        )
    return redirect('join_game', game_id=game["game_id"])


def join_game(request, game_id):
    api = DataLayerAPI()
    game = get_object_or_404(Games, game_id=game_id)

    if game.player_two and game.player_one:
        return render(request, "games/full.html")  # Show an error template or redirect

    elif not game.player_two and game.player_one != request.user:
        api.edit_game(game.game_id,"player_two",request.user.id)

    return render(request, 'games/session.html', {"game": game_id})