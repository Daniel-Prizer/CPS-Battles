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
print(api.get_games_for_user_id(1))

import random
import string
from DataLayer.API import DataLayerAPI


# Helper to generate random usernames and bios
def random_username():
    return ''.join(random.choices(string.ascii_lowercase, k=8))

def random_bio():
    return 'Bio: ' + ''.join(random.choices(string.ascii_letters + ' ', k=20))

flags = ['🇮🇸', '🇺🇸', '🇬🇧', '🇩🇪', '🇫🇷', '🇪🇸', '🇮🇹', '🇯🇵', '🇨🇳', '🇧🇷']

user_ids = []
# Create 10 random users
for _ in range(10):
    username = random_username()
    password = 'testpass'
    bio = random_bio()
    flag = random.choice(flags)
    user = api.register_user(username=username, password=password, bio=bio, flag_emoji=flag)
    user_ids.append(user['id'])

# Create 20 random games between users
modes = ['First to 50 clicks', 'Best top speed in 25s']
for _ in range(20):
    p1, p2 = random.sample(user_ids, 2)
    p1_cps = round(random.uniform(5, 15), 2)
    p2_cps = round(random.uniform(5, 15), 2)
    mode = random.choice(modes)
    api.register_game(
        player_one=p1,
        player_one_cps=p1_cps,
        player_two=p2,
        player_two_cps=p2_cps,
        mode=mode
    )

# Update each user's top_cps based on all games
for user_id in user_ids:
    games = api.get_games_for_user_id(user_id)
    top_cps = round(random.uniform(5, 15), 2)
    for game in games:
        if game["player_one"] == user_id and game["player_one_cps"] is not None:
            top_cps = max(top_cps, game["player_one_cps"])
        if game["player_two"] == user_id and game["player_two_cps"] is not None:
            top_cps = max(top_cps, game["player_two_cps"])
    api.edit_user(user_id, "top_cps", top_cps)

print("Updated users' top_cps from their games.")

print("Created 10 users and 20 games.")