from django.urls import path
from . import views


urlpatterns = [
    path("api/users/<int:user_id>/", views.user_detail_api, name="user_detail_api"),  # GET, POST (edit)
    path('user/', views.edit_user, name='edit_user'),  # web form
    path('user/<int:user_id>/', views.user_profile, name='user_profile'),  # web profile
]
