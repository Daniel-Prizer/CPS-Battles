from django.urls import path
from . import views

urlpatterns = [
    path("api/get_user/<int:user_id>/", views.get_user, name="get_user"),
]
