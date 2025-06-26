from django.urls import path
from . import views

urlpatterns = [
    path('leaderboard/', views.users_list, name='leaderboard'),
]
