import sys
import os
import traceback
from pathlib import Path
import django

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, PROJECT_ROOT)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "CPS_Battles.settings")

django.setup()
import uuid

from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.files.storage import default_storage
from django.db.models import Q

from DataLayer.API import DataLayerAPI

BASE_DIR = Path(__file__).resolve().parent
api = DataLayerAPI()

""" for game in api.get_games_for_user_id(1):
    api.delete_game(game["game_id"])

print(api.get_games_for_user_id(1)) """

import uuid
#print(api.edit_game(uuid.UUID('6371dc39-c472-44bc-a1d5-31313063bf63'),"started",False))
""" print(api.edit_game(uuid.UUID('6371dc39-c472-44bc-a1d5-31313063bf63'),"winning_player",None))
print(api.get_game(uuid.UUID('6371dc39-c472-44bc-a1d5-31313063bf63'))) """
print(api.get_game(uuid.UUID('a0005447-d177-4115-a611-d101a029def6')))