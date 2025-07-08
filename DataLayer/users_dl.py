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
        user_dict = model_to_dict(user)
        user_dict["password"] = ""
        return user_dict

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
        user_dict = model_to_dict(user)
        user_dict["password"] = ""
        return user_dict

    def get_user_by_username(self, username: str) -> dict:
        user = Users.objects.get(username=username)
        user_dict = model_to_dict(user)
        user_dict["password"] = ""
        return user_dict

    def get_all_users(self) -> list:
        toRet = []
        for user in Users.objects.all():
            user_dict = model_to_dict(user)
            user_dict["password"] = ""
            toRet.append(user_dict)
        return toRet

