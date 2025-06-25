from django.urls import path
from . import views

urlpatterns = [
    path('leaderboard', views.render_leaderboard, name='render_leaderboard'),
]
