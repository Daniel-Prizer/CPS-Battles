from DataLayer.django_init import setup_django
from django.forms.models import model_to_dict
from django.contrib.auth import get_user_model

from users.models import Users
from games.models import Games

setup_django()
User = get_user_model()

class users_dl:
    def register_user(self,         
        username: str,
        bio: str,
        password: str,
        flag_emoji: str,) -> dict:
        user = Users.objects.create_user(
            username=username,
            flag_emoji=flag_emoji,
            bio=bio,
            password=password,
        )
        return model_to_dict(user)

    def edit_user(self, user_id: int, field: str, replacement: str) -> dict:
        user = Users.objects.get(id=user_id)
        if field.lower() not in ["bio", "avatar", "banner", "top_cps","top_cps_game_id"]:
            print(field)
            raise Exception("'field' must be one of: [bio, avatar, banner, top_cps, top_cps_game_id]")
        elif field.lower() == "bio":
            user.bio = replacement
            user.save(update_fields=["bio"])
        elif field.lower() == "avatar":
            user.avatar = replacement
            user.save(update_fields=["avatar"])
        elif field.lower() == "banner":
            user.banner = replacement
            user.save(update_fields=["banner"])
        elif field.lower() == "top_cps":
            user.top_cps = replacement
            user.save(update_fields=["top_cps"])
        elif field.lower() == "top_cps_game_id":
            user.top_cps_game_id = Games.objects.get(game_id=replacement)
            user.save(update_fields=["top_cps_game_id"])

        return self.get_user_by_id(user_id)

    def delete_user(self, user_id: int) -> dict:
        user = Users.objects.get(id=user_id)
        to_return = model_to_dict(user)
        # Delete user
        user.delete()
        return to_return

    def get_user_by_id(self, user_id: str) -> dict:
        user = Users.objects.get(id=user_id)
        return model_to_dict(user)

    def get_user_by_username(self, username: str) -> dict:
        user = Users.objects.get(username=username)
        return model_to_dict(user)

    def get_all_users(self) -> list:
        return [model_to_dict(user) for user in Users.objects.all()]

class games_dl:
    def register_game(self,
        player_one: int,
        player_one_cps: float,
        player_two: int,
        player_two_cps: float,
        mode: str,) -> dict:
        if player_two:
            game = Games.objects.create(
                player_one = Users.objects.get(id=player_one),
                player_one_cps = player_one_cps,
                player_two = Users.objects.get(id=player_two),
                player_two_cps = player_two_cps,
                mode = mode,
            )
        else:
            game = Games.objects.create(
                player_one = Users.objects.get(id=player_one),
                player_one_cps = player_one_cps,
                mode = mode,
            )
        model_dict = model_to_dict(game)
        model_dict["game_id"] = game.game_id
        return model_dict
    

    def edit_game(self, game_id: int, field: str, replacement: str) -> dict:
        game = Games.objects.get(game_id=game_id)
        if field.lower() not in [
        "player_one_clicks", 
        "player_one_cps", 
        "player_two", 
        "player_two_clicks", 
        "player_two_cps", 
        "winning_player",
        "mode", 
        "started",
        "timestamp",
        ]:
            print(field)
            raise Exception("'field' must be one of: [player_one_clicks, player_one_cps, player_two, player_two_clicks, player_two_cps, winning_player, mode, started, timestamp]")
        elif field.lower() == "player_one_cps":
            game.player_one_cps = replacement
            game.save(update_fields=["player_one_cps"])
        elif field.lower() == "player_one_clicks":
            game.player_one_clicks = replacement
            game.save(update_fields=["player_one_clicks"])
        elif field.lower() == "player_two":
            game.player_two = Users.objects.get(id=replacement)
            game.save(update_fields=["player_two"])
        elif field.lower() == "player_two_clicks":
            game.player_two_clicks = replacement
            game.save(update_fields=["player_two_clicks"])
        elif field.lower() == "player_two_cps":
            game.player_two_cps = replacement
            game.save(update_fields=["player_two_cps"])
        elif field.lower() == "winning_player":
            game.winning_player = Users.objects.get(id=replacement)
            game.save(update_fields=["winning_player"])
        elif field.lower() == "mode":
            game.mode = replacement
            game.save(update_fields=["mode"])
        elif field.lower() == "started":
            game.started = replacement
            game.save(update_fields=["started"])
        elif field.lower() == "timestamp":
            game.timestamp = replacement
            game.save(update_fields=["timestamp"])
        model_dict = model_to_dict(game)
        model_dict["game_id"] = game.game_id
        return model_dict


    def delete_game(self, game_id: int) -> dict:
        game = Games.objects.get(game_id=game_id)
        model_dict = model_to_dict(game)
        model_dict["game_id"] = game.game_id
        # Delete game
        game.delete()
        return model_dict



    def get_games_for_user_id(self, user_id: int) -> list:
        lis = []
        for game in Games.objects.filter(player_one=user_id):
            model_dict = model_to_dict(game)
            model_dict["game_id"] = game.game_id
            lis.append(model_dict)
        for game in Games.objects.filter(player_two=user_id):
            model_dict = model_to_dict(game)
            model_dict["game_id"] = game.game_id
            lis.append(model_dict)
        return lis
    
    def get_game(self, game_id: int) -> dict:
        game = Games.objects.get(game_id=game_id)
        return model_to_dict(game)
