from django.urls import path
from . import views

urlpatterns = [
    path('game/create/', views.create_game, name='create_game'),
    path('game/<uuid:game_id>/', views.join_game, name='join_game'),
    path('api/game/<uuid:game_id>/', views.edit_game, name='edit_game'),
    path("api/get_game/<uuid:game_id>/", views.get_game, name="get_game"),
    path("api/get_games_for_user/<int:user_id>/", views.get_games_for_user, name="get_games_for_user"),
    path("game/<uuid:game_id>/play", views.render_game, name="render_game"),
]
