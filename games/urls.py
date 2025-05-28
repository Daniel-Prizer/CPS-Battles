from django.urls import path
from . import views

urlpatterns = [
    path('game/create/', views.create_game, name='create_game'),
    path('game/<uuid:game_id>/', views.join_game, name='join_game'),
]
