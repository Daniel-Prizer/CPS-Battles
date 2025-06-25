from django.urls import path
from . import views

urlpatterns = [
    path("api/get_user/<int:user_id>/", views.get_user, name="get_user"),
    path('api/user/', views.edit_user, name='edit_user'),
    path('user/<int:user_id>/', views.user_profile, name='user_profile'),
]
