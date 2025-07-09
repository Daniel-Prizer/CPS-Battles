from django.shortcuts import render, redirect

from login.forms.register_form import RegisterForm

from django.contrib.auth import authenticate, login, logout

from DataLayer.API import DataLayerAPI

from django.contrib import messages

# Function to turn an iso code into the emoji flag
def country_code_to_flag(country_code):
    if not country_code or len(country_code) != 2:
        return ""
    return chr(ord(country_code[0].upper()) + 127397) + chr(ord(country_code[1].upper()) + 127397)


def loginPage(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        
        # attemp to authenticate
        user = authenticate(request, username=username, password=password)

        # if the user authenticated:
        if user is not None:
            login(request, user)
            messages.success(request, "Login success.")
            return redirect("/")
        else: # if didnt authenticate:
            messages.error(request, "Username or password are incorrect.")
    return render(request, "login/login.html")

def registerPage(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)

        # if the form has no errors
        if form.is_valid():
            api = DataLayerAPI()

            data = form.cleaned_data

            # convert the iso code into an emoji flag
            country_code = data.get("country_code")
            country_flag = country_code_to_flag(country_code)
        
        # create the user in the db
            api.register_user(
                data.get("username"),
                data.get("password1"),
                "",
                country_flag
            )
            return redirect("/login")
    else: # if the user wasnt sending a register request then send the form over
        form = RegisterForm()

    return render(request, "login/register.html", {"form": form})

def logoutUser(request):
    logout(request)
    return redirect("/")


