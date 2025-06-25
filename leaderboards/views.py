from django.shortcuts import render

# Create your views here.

def render_leaderboard(request,):
    return render(request, 'leaderboards/leaderboard.html')