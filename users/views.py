from django.shortcuts import render
from django.shortcuts import redirect
from .models import Users
from DataLayer.API import DataLayerAPI
from django.http import JsonResponse
import json
api = DataLayerAPI()

# Create your views here.

def get_user(request, user_id):
    user = api.get_user_by_id(user_id)
    user['avatar'] = str(user['avatar']) if user['avatar'] else ''
    user['banner'] = str(user['banner']) if user['banner'] else ''
    return JsonResponse(user)

def edit_user(request, user_id):
    # expects edit field to be one of the ones listed under api.py
    if request.method == "POST":
        data = json.loads(request.body)
        edit_field = data.get("edit_field")
        edit_replacement = data.get("edit_replacement")
        return JsonResponse(api.edit_user(user_id, edit_field, edit_replacement))
    else:
        return JsonResponse({"error": "Only POST allowed"}, status=405)