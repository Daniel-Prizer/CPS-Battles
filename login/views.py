from django.shortcuts import render, redirect

from login.forms.register_form import RegisterForm

from django.contrib.auth import authenticate, login, logout

from DataLayer.API import DataLayerAPI

from django.contrib import messages


def country_code_to_flag(country_code):
    if not country_code or len(country_code) != 2:
        return ""
    return chr(ord(country_code[0].upper()) + 127397) + chr(ord(country_code[1].upper()) + 127397)


# Create your views here.
def loginPage(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, "Login success.")
            return redirect("/")
        else:
            messages.error(request, "Username or password are incorrect.")
    return render(request, "login/login.html")

def registerPage(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)

        if form.is_valid():
            api = DataLayerAPI()

            data = form.cleaned_data

            country_code = data.get("country_code")
            country_flag = country_code_to_flag(country_code)

            api.register_user(
                data.get("username"),
                data.get("password1"),
                "",
                country_flag
            )




            return redirect("/login")
    else:
        form = RegisterForm()

    return render(request, "login/register.html", {"form": form})

def logoutUser(request):
    logout(request)
    return redirect("/")


