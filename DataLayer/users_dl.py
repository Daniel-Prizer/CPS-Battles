from DataLayer.django_init import setup_django
from django.forms.models import model_to_dict
from django.contrib.auth import get_user_model

from users.models import Users
from users.models import Games

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
                mode = mode
            )
        else:
            game = Games.objects.create(
                player_one = Users.objects.get(id=player_one),
                player_one_cps = player_one_cps,
                mode = mode
            )
        return model_to_dict(game)


    def delete_game(self, game_id: int) -> dict:
        game = Games.objects.get(game_id=game_id)
        to_return = model_to_dict(game)
        # Delete game
        game.delete()
        return to_return


    def get_games_for_user_id(self, user_id: int) -> list:
        lis = [model_to_dict(game) for game in Games.objects.filter(player_one=user_id)]
        for game in Games.objects.filter(player_two=user_id):
            lis.append(model_to_dict(game))
        return lis
