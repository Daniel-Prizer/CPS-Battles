from django.urls import path

from . import views

from django.contrib.auth.views import LoginView

from django.urls import path
from .views import loginPage, registerPage, logoutUser

app_name = "login"  # optional but helps when using {% url %}

urlpatterns = [
    path("", loginPage, name="login"),  # <-- use your custom view here
    path("register/", registerPage, name="register"),
    path("logout/", logoutUser, name="logout"),
]
