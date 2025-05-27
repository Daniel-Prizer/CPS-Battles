from django.urls import path

from . import views

from django.contrib.auth.views import LoginView

from django.urls import path
from .views import registerPage, logoutUser
from django.contrib.auth.views import LoginView

app_name = "login"  # optional but helps when using {% url %}

urlpatterns = [
    path("", LoginView.as_view(template_name="login/login.html"), name="login"),
    path("register/", registerPage, name="register"),
    path("logout/", logoutUser, name="logout"),
    
]
