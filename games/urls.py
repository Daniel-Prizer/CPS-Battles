from django.urls import path
from . import views

urlpatterns = [
    path('games/create/', views.create_game, name='create_game'),  # web form
    path('games/<uuid:game_id>/', views.join_game, name='join_game'),  # web join/session
    path('games/<uuid:game_id>/play/', views.render_game, name='render_game'),  # web gameplay

    # RESTful API endpoints
    path('api/games/<uuid:game_id>/', views.game_detail_api, name='game_detail_api'),  # GET, POST (edit)
    path('api/games/', views.games_for_user_api, name='games_for_user_api'),  # GET with ?user_id=
    path('api/server-time/', views.server_time, name='server_time'),
]