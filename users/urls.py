from django.urls import path
from . import views

urlpatterns = [
    path("api/get_user/<int:user_id>/", views.get_user, name="get_user"),
    path('user/', views.edit_user, name='edit_user'),
    path('api/user/<int:user_id>/', views.edit_user_DLAPI, name='edit_user_DLAPI'),
    path('user/<int:user_id>/', views.user_profile, name='user_profile'),
]
