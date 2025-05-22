import sys
import os
import traceback
from pathlib import Path
import django

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, PROJECT_ROOT)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "CPS_Battles.settings")

django.setup()

from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.files.storage import default_storage
from django.db.models import Q

from DataLayer.API import DataLayerAPI

BASE_DIR = Path(__file__).resolve().parent
api = DataLayerAPI()

import traceback

def main():
    created_user_ids = []
    created_game_ids = []

    try:
        print("\n✅ Starting DataLayerAPI functional tests...\n")

        # --- Register 2 Users ---
        user1 = api.register_user("player_one", "bio one", "pass123", "🇮🇸")
        user2 = api.register_user("player_two", "bio two", "pass456", "🇱🇹")
        user1_id = user1["id"]
        user2_id = user2["id"]
        created_user_ids += [user1_id, user2_id]

        # --- Working functions ---
        api.get_user_by_id(user1_id)
        api.get_user_by_username("player_one")
        api.edit_user(user1_id, "bio", "updated bio")
        api.get_all_users()

        game = api.register_game(
            player_one=user1_id,
            player_one_cps=12.5,
            player_two=user2_id,
            player_two_cps=10.2,
            mode="ranked"
        )
        game_id = game["game_id"]
        created_game_ids.append(game_id)

        api.get_games_for_user_id(user1_id)
        api.delete_game(game_id)
        created_game_ids.remove(game_id)

        # --- Invalid field edit ---
        try:
            print("\n▶️ Testing invalid field edit...")
            api.edit_user(user1_id, "nonexistent_field", "fail")
            print("❌ FAIL: Invalid field edit did not raise error")
        except Exception:
            print("✅ PASS: Invalid field edit raised error")

        # --- Game with invalid user ---
        try:
            print("\n▶️ Testing game creation with bad user...")
            api.register_game(
                player_one=999999,
                player_one_cps=5.0,
                player_two=user2_id,
                player_two_cps=5.0,
                mode="test"
            )
            print("❌ FAIL: Game with invalid user did not raise error")
        except Exception:
            print("✅ PASS: Game with invalid user raised error")

        # --- Get user with invalid ID ---
        try:
            print("\n▶️ Testing get_user_by_id with invalid ID...")
            api.get_user_by_id(999999)
            print("❌ FAIL: Invalid user fetch did not raise error")
        except Exception:
            print("✅ PASS: Invalid user fetch raised error")

        # --- Delete nonexistent game ---
        try:
            print("\n▶️ Testing delete_game with invalid ID...")
            api.delete_game(999999)
            print("❌ FAIL: Deleting nonexistent game did not raise error")
        except Exception:
            print("✅ PASS: Deleting nonexistent game raised error")

        # --- Delete nonexistent user ---
        try:
            print("\n▶️ Testing delete_user with invalid ID...")
            api.delete_user(999999)
            print("❌ FAIL: Deleting nonexistent user did not raise error")
        except Exception:
            print("✅ PASS: Deleting nonexistent user raised error")

        # --- Clean up valid users at end ---
        api.delete_user(user1_id)
        api.delete_user(user2_id)
        created_user_ids.clear()

    except Exception:
        print("\n❌ UNEXPECTED ERROR during test run:\n")
        traceback.print_exc()

    finally:
        print("\n🧹 Cleaning up...")
        for uid in created_user_ids:
            try:
                print(f"Force-deleting user {uid}")
                api.delete_user(uid)
            except Exception as e:
                print(f"Failed to delete user {uid}: {e}")

        for gid in created_game_ids:
            try:
                print(f"Force-deleting game {gid}")
                api.delete_game(gid)
            except Exception as e:
                print(f"Failed to delete game {gid}: {e}")

        print("✅ Cleanup complete.")

if __name__ == "__main__":
    main()
