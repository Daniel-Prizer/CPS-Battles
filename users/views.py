from django.shortcuts import render
from django.shortcuts import redirect
from .models import Users
from DataLayer.API import DataLayerAPI
from django.http import JsonResponse

api = DataLayerAPI()

# Create your views here.

def get_user(request, user_id):
    user = api.get_user_by_id(user_id)
    user['avatar'] = str(user['avatar']) if user['avatar'] else ''
    user['banner'] = str(user['banner']) if user['banner'] else ''
    return JsonResponse(user)